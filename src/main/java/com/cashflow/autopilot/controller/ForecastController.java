package com.cashflow.autopilot.controller;

import org.springframework.beans.factory.annotation.Value;
import com.cashflow.autopilot.repository.CashAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.time.LocalDate;

@RestController
@RequestMapping("/api")
public class ForecastController {
    private final RestClient client;
    private final CashAccountRepository accounts;

    public ForecastController(RestClient.Builder builder, @Value("${cashflow.forecast-url:http://localhost:8070}") String forecastUrl, CashAccountRepository accounts) {
        this.accounts = accounts;
        var factory = new JdkClientHttpRequestFactory(java.net.http.HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2)).build());
        factory.setReadTimeout(Duration.ofSeconds(5));
        this.client = builder.baseUrl(forecastUrl).requestFactory(factory).build();
    }

    @GetMapping("/forecast")
    public ResponseEntity<String> forecast(@RequestParam long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, @RequestParam(defaultValue = "91") int days) {
        return forward("/api/forecast", cashAccountId, startDate, days);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<String> summary(@RequestParam long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, @RequestParam(defaultValue = "91") int days) {
        return forward("/api/dashboard/summary", cashAccountId, startDate, days);
    }

    private ResponseEntity<String> forward(String path, long accountId, LocalDate start, int days) {
        if (days < 1 || days > 366) {
            return ResponseEntity.badRequest().contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Forecast horizon must be between 1 and 366 days\"}");
        }
        if (!accounts.existsById(accountId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Cash account not found\"}");
        }
        try {
            var response = client.get().uri(uri -> uri.path(path).queryParam("cashAccountId", accountId)
                    .queryParam("startDate", start).queryParam("days", days).build()).retrieve().toEntity(String.class);
            return ResponseEntity.status(response.getStatusCode()).headers(responseHeaders(response.getHeaders()))
                    .body(response.getBody());
        } catch (RestClientResponseException error) {
            if (error.getStatusCode().value() == 404) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.APPLICATION_JSON)
                        .header("Retry-After", "1")
                        .body("{\"message\":\"Forecast is catching up. Retry shortly.\"}");
            }
            return ResponseEntity.status(error.getStatusCode()).headers(responseHeaders(error.getResponseHeaders()))
                    .body(error.getResponseBodyAsString());
        } catch (ResourceAccessException error) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\":\"Forecast service is unavailable\"}");
        }
    }

    private HttpHeaders responseHeaders(HttpHeaders upstream) {
        var result = new HttpHeaders();
        result.setContentType(MediaType.APPLICATION_JSON);
        if (upstream != null) {
            for (String name : java.util.List.of(HttpHeaders.CONTENT_TYPE, "X-Projection-Revision", HttpHeaders.RETRY_AFTER)) {
                String value = upstream.getFirst(name);
                if (value != null) {
                    result.set(name, value);
                }
            }
        }
        return result;
    }
}
