package com.cashflow.forecast;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Testcontainers
@EmbeddedKafka(partitions = 3, topics = "cashflow.account-snapshots.v1",
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
class AccountProjectionIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", postgres::getJdbcUrl);
        properties.add("spring.datasource.username", postgres::getUsername);
        properties.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired AccountProjection projection;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired KafkaTemplate<String, String> kafka;
    @Autowired KafkaListenerEndpointRegistry listeners;

    @BeforeEach
    void clearProjection() {
        jdbc.update("DELETE FROM processed_events");
        jdbc.update("DELETE FROM account_projections");
    }

    @Test
    void duplicateAndOlderEventsCannotOverwriteNewerState() throws Exception {
        var newest = snapshot(11, 3, false);
        apply(newest);
        apply(newest);
        apply(snapshot(11, 1, false));
        assertThat(projection.get(11).revision()).isEqualTo(3);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM processed_events", Integer.class)).isEqualTo(2);
        assertThat(new AccountProjection(jdbc, mapper).get(11)).isEqualTo(newest);
    }

    @Test
    void deletionSurvivesReplayOfEarlierSnapshot() throws Exception {
        apply(snapshot(12, 1, false));
        apply(snapshot(12, 2, true));
        apply(snapshot(12, 1, false));
        assertThatThrownBy(() -> projection.get(12)).isInstanceOf(ResponseStatusException.class);
        assertThat(jdbc.queryForObject("SELECT revision FROM account_projections WHERE account_id = 12", Long.class)).isEqualTo(2);
    }

    @Test
    void failedProjectionRollsBackInboxAndCanBeReplayed() throws Exception {
        var event = snapshot(42, 1, false);
        jdbc.execute("ALTER TABLE account_projections ADD CONSTRAINT reject_test_account CHECK (account_id <> 42)");
        try {
            assertThatThrownBy(() -> apply(event)).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM processed_events", Integer.class)).isZero();
        } finally {
            jdbc.execute("ALTER TABLE account_projections DROP CONSTRAINT reject_test_account");
        }
        apply(event);
        assertThat(projection.get(42)).isEqualTo(event);
    }

    @Test
    void resumesKafkaConsumptionAfterListenerRestart() throws Exception {
        var first = snapshot(99, 1, false);
        kafka.send("cashflow.account-snapshots.v1", "99", mapper.writeValueAsString(first)).get();
        await().atMost(Duration.ofSeconds(20)).ignoreExceptions().untilAsserted(() ->
                assertThat(projection.get(99).revision()).isEqualTo(1));
        listeners.stop();
        var second = snapshot(99, 2, false);
        kafka.send("cashflow.account-snapshots.v1", "99", mapper.writeValueAsString(second)).get();
        assertThat(projection.get(99).revision()).isEqualTo(1);
        listeners.start();
        await().atMost(Duration.ofSeconds(20)).ignoreExceptions().untilAsserted(() ->
                assertThat(projection.get(99).revision()).isEqualTo(2));
    }

    private AccountSnapshot snapshot(long accountId, long revision, boolean deleted) {
        return new AccountSnapshot(1, UUID.randomUUID(), accountId, revision, deleted, deleted ? null : "RUB",
                List.of(), List.of(), List.of());
    }

    private void apply(AccountSnapshot event) throws Exception {
        projection.apply(Long.toString(event.accountId()), mapper.writeValueAsString(event));
    }
}
