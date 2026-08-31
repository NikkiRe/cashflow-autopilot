package com.cashflow.autopilot.events;

import com.cashflow.autopilot.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(propagation = Propagation.MANDATORY)
public class AccountOutbox {
    private final JdbcTemplate jdbc;
    private final EntityManager entityManager;
    private final ObjectMapper mapper;
    private final CashAccountRepository accounts;
    private final InvoiceRepository invoices;
    private final ObligationRepository obligations;
    private final BankTransactionRepository transactions;

    public AccountOutbox(JdbcTemplate jdbc, EntityManager entityManager, ObjectMapper mapper,
                         CashAccountRepository accounts, InvoiceRepository invoices,
                         ObligationRepository obligations, BankTransactionRepository transactions) {
        this.jdbc = jdbc;
        this.entityManager = entityManager;
        this.mapper = mapper;
        this.accounts = accounts;
        this.invoices = invoices;
        this.obligations = obligations;
        this.transactions = transactions;
    }

    public void lock(long accountId) {
        jdbc.update("INSERT INTO account_revisions(account_id) VALUES (?) ON CONFLICT DO NOTHING", accountId);
        jdbc.queryForObject("SELECT revision FROM account_revisions WHERE account_id = ? FOR UPDATE", Long.class, accountId);
    }

    public void snapshot(long accountId) {
        entityManager.flush();
        var account = accounts.findById(accountId).orElseThrow();
        var invoiceLines = invoices.findByCashAccountId(accountId).stream()
                .map(i -> new AccountSnapshot.InvoiceLine(i.getDueDate(), i.getAmount(), i.getStatus().name())).toList();
        var obligationLines = obligations.findByCashAccountId(accountId).stream()
                .map(o -> new AccountSnapshot.ObligationLine(o.getNextDueDate(), o.getAmount(),
                        o.getRecurrence().name(), Boolean.TRUE.equals(o.getActive()))).toList();
        var transactionLines = transactions.findByCashAccountId(accountId).stream()
                .map(t -> new AccountSnapshot.TransactionLine(t.getBookedAt(), t.getAmount(), t.getDirection().name())).toList();
        append(accountId, false, account.getCurrency(), invoiceLines, obligationLines, transactionLines);
    }

    public void deleted(long accountId) {
        entityManager.flush();
        append(accountId, true, null, List.of(), List.of(), List.of());
    }

    private void append(long accountId, boolean deleted, String currency,
                        List<AccountSnapshot.InvoiceLine> invoices,
                        List<AccountSnapshot.ObligationLine> obligations,
                        List<AccountSnapshot.TransactionLine> transactions) {
        long revision = jdbc.queryForObject(
                "UPDATE account_revisions SET revision = revision + 1 WHERE account_id = ? RETURNING revision",
                Long.class, accountId);
        UUID eventId = UUID.randomUUID();
        var snapshot = new AccountSnapshot(1, eventId, accountId, revision, deleted, currency, invoices, obligations, transactions);
        try {
            jdbc.update("INSERT INTO account_outbox(event_id, account_id, revision, payload) VALUES (?, ?, ?, ?)",
                    eventId, accountId, revision, mapper.writeValueAsString(snapshot));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot encode account event", e);
        }
    }
}
