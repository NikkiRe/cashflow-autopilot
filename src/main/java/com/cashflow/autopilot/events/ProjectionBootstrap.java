package com.cashflow.autopilot.events;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ProjectionBootstrap {
    private final JdbcTemplate jdbc;
    private final AccountOutbox outbox;

    public ProjectionBootstrap(JdbcTemplate jdbc, AccountOutbox outbox) {
        this.jdbc = jdbc;
        this.outbox = outbox;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedExistingAccounts() {
        var ids = jdbc.queryForList("SELECT id FROM cash_accounts a WHERE NOT EXISTS " +
                "(SELECT 1 FROM account_revisions r WHERE r.account_id = a.id) ORDER BY id", Long.class);
        for (Long id : ids) {
            outbox.lock(id);
            outbox.snapshot(id);
        }
    }
}
