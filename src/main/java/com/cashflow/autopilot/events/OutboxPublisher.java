package com.cashflow.autopilot.events;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Component
@ConditionalOnProperty(name = "cashflow.events.publish-enabled", havingValue = "true", matchIfMissing = true)
public class OutboxPublisher {
    private final JdbcTemplate jdbc;
    private final KafkaTemplate<String, String> kafka;
    private final String topic;

    public OutboxPublisher(JdbcTemplate jdbc, KafkaTemplate<String, String> kafka,
                           @Value("${cashflow.events.topic}") String topic) {
        this.jdbc = jdbc;
        this.kafka = kafka;
        this.topic = topic;
    }

    @Scheduled(fixedDelayString = "${cashflow.events.publish-delay-ms:500}")
    @Transactional
    public void publishPending() throws Exception {
        Boolean publisherLock = jdbc.queryForObject("SELECT pg_try_advisory_xact_lock(78431002)", Boolean.class);
        if (!Boolean.TRUE.equals(publisherLock)) {
            return;
        }
        var pending = jdbc.query("SELECT id, account_id, payload FROM account_outbox " +
                        "WHERE published_at IS NULL ORDER BY id LIMIT 20 FOR UPDATE SKIP LOCKED",
                (rs, row) -> new Pending(rs.getLong("id"), rs.getLong("account_id"), rs.getString("payload")));
        for (var event : pending) {
            kafka.send(topic, Long.toString(event.accountId()), event.payload()).get(10, TimeUnit.SECONDS);
            jdbc.update("UPDATE account_outbox SET published_at = now() WHERE id = ?", event.id());
        }
    }

    private record Pending(long id, long accountId, String payload) {}
}
