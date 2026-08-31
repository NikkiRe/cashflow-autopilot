package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.repository.CashAccountRepository;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ForecastControllerTest {
    private final CashAccountRepository accounts = mock(CashAccountRepository.class);
    private final AtomicInteger upstreamStatus = new AtomicInteger(200);
    private final LocalDate start = LocalDate.of(2026, 10, 7);
    private HttpServer upstream;
    private ForecastController controller;
    private static final String BODY = "{\"points\":[]}";

    @BeforeEach
    void startUpstream() throws Exception {
        upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        upstream.createContext("/api/", exchange -> {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("X-Projection-Revision", "7");
            exchange.getResponseHeaders().set("Retry-After", "2");
            exchange.getResponseHeaders().set("Connection", "keep-alive");
            exchange.sendResponseHeaders(upstreamStatus.get(), 0);
            try (var body = exchange.getResponseBody()) {
                body.write(BODY.getBytes(StandardCharsets.UTF_8));
            }
        });
        upstream.start();
        when(accounts.existsById(1L)).thenReturn(true);
        controller = new ForecastController(RestClient.builder(),
                "http://127.0.0.1:" + upstream.getAddress().getPort(), accounts);
    }

    @AfterEach
    void stopUpstream() {
        upstream.stop(0);
    }

    @Test
    void chunkedSuccessCopiesBodyAndRevisionWithoutTransportHeaders() {
        var response = controller.forecast(1, start, 30);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertSafeForwarding(response);
    }

    @Test
    void chunkedErrorPreservesStatusAndRetryAfterWithoutTransportHeaders() {
        upstreamStatus.set(429);
        var response = controller.summary(1, start, 30);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertSafeForwarding(response);
    }

    @Test
    void generatedValidationAndMissingAccountErrorsAreJson() {
        var invalid = controller.forecast(1, start, 367);
        assertThat(invalid.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalid.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
        var missing = controller.forecast(2, start, 30);
        assertThat(missing.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(missing.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
    }

    @Test
    void missingProjectionReturnsJsonWithRetryAfter() {
        upstreamStatus.set(404);
        var response = controller.forecast(1, start, 30);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
        assertThat(response.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo("1");
        assertThat(response.getHeaders()).doesNotContainKeys(HttpHeaders.TRANSFER_ENCODING, HttpHeaders.CONTENT_LENGTH,
                HttpHeaders.CONNECTION);
    }

    private void assertSafeForwarding(ResponseEntity<String> response) {
        assertThat(response.getBody()).isEqualTo(BODY);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
        assertThat(response.getHeaders().getFirst("X-Projection-Revision")).isEqualTo("7");
        assertThat(response.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)).isEqualTo("2");
        assertThat(response.getHeaders()).doesNotContainKeys(HttpHeaders.TRANSFER_ENCODING, HttpHeaders.CONTENT_LENGTH,
                HttpHeaders.CONNECTION, "Keep-Alive");
    }
}
