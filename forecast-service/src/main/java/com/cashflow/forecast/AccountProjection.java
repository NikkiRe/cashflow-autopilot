package com.cashflow.forecast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountProjection {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public AccountProjection(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @Transactional
    public void apply(String key, String payload) throws JsonProcessingException {
        var event = mapper.readValue(payload, AccountSnapshot.class);
        if (event.schemaVersion() != 1 || event.eventId() == null || event.revision() < 1 ||
                !Long.toString(event.accountId()).equals(key)) {
            throw new IllegalArgumentException("Invalid account event envelope");
        }
        int inserted = jdbc.update("INSERT INTO processed_events(event_id) VALUES (?) ON CONFLICT DO NOTHING", event.eventId());
        if (inserted == 0) {
            return;
        }
        jdbc.update("INSERT INTO account_projections(account_id, revision, deleted, payload) VALUES (?, ?, ?, ?) " +
                        "ON CONFLICT (account_id) DO UPDATE SET revision = EXCLUDED.revision, " +
                        "deleted = EXCLUDED.deleted, payload = EXCLUDED.payload, updated_at = now() " +
                        "WHERE account_projections.revision < EXCLUDED.revision",
                event.accountId(), event.revision(), event.deleted(), payload);
    }

    @Transactional(readOnly = true)
    public AccountSnapshot get(long accountId) {
        var payloads = jdbc.queryForList("SELECT payload FROM account_projections WHERE account_id = ? AND NOT deleted",
                String.class, accountId);
        if (payloads.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cash account projection not found");
        }
        try {
            return mapper.readValue(payloads.getFirst(), AccountSnapshot.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot read stored account snapshot", e);
        }
    }
}
