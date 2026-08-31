package com.cashflow.autopilot.integration;

import com.cashflow.autopilot.CashflowAutopilotApplication;
import com.cashflow.autopilot.config.DemoProperties;
import com.cashflow.autopilot.domain.entity.Company;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import com.cashflow.autopilot.domain.enums.RecurrenceType;
import com.cashflow.autopilot.domain.enums.TransactionDirection;
import com.cashflow.autopilot.dto.CreateBankTransactionRequest;
import com.cashflow.autopilot.dto.CreateCashAccountRequest;
import com.cashflow.autopilot.dto.CreateInvoiceRequest;
import com.cashflow.autopilot.dto.CreateObligationRequest;
import com.cashflow.autopilot.events.AccountSnapshot;
import com.cashflow.autopilot.events.ProjectionBootstrap;
import com.cashflow.autopilot.repository.CompanyRepository;
import com.cashflow.autopilot.service.BankTransactionService;
import com.cashflow.autopilot.service.CashAccountService;
import com.cashflow.autopilot.service.DemoDataSeedService;
import com.cashflow.autopilot.service.ForecastService;
import com.cashflow.autopilot.service.InvoiceService;
import com.cashflow.autopilot.service.ObligationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = CashflowAutopilotApplication.class)
@Testcontainers
class AccountOutboxIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("outbox_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired CompanyRepository companies;
    @Autowired CashAccountService accounts;
    @Autowired BankTransactionService transactions;
    @Autowired InvoiceService invoices;
    @Autowired ObligationService obligations;
    @Autowired DemoDataSeedService demoSeed;
    @Autowired DemoProperties demoProperties;
    @Autowired ProjectionBootstrap bootstrap;
    @Autowired ForecastService forecast;
    @Autowired PlatformTransactionManager transactionManager;

    @BeforeEach
    void clearDatabase() {
        jdbc.execute("TRUNCATE TABLE companies, account_revisions, account_outbox RESTART IDENTITY CASCADE");
        demoProperties.setEnabled(true);
        demoProperties.setSeedOnStartup(false);
    }

    @Test
    void createsCompleteSnapshotsAndDeletionTombstone() throws Exception {
        long accountId = createAccount();
        var initial = latest(accountId);
        assertEquals(1, initial.schemaVersion());
        assertEquals(1, initial.revision());
        assertEquals("RUB", initial.currency());
        assertFalse(initial.deleted());
        assertTrue(initial.transactions().isEmpty());

        LocalDate today = LocalDate.of(2026, 10, 7);
        var transaction = transactions.createTransaction(transaction(accountId, "1000.00", today.minusDays(1)));
        var invoice = invoices.createInvoice(new CreateInvoiceRequest(accountId, null, "INV-1",
                today.minusDays(1), today.plusDays(1), new BigDecimal("250.00"), "RUB",
                InvoiceStatus.ISSUED, "Services"));
        var obligation = obligations.createObligation(new CreateObligationRequest(accountId, "Rent",
                new BigDecimal("125.00"), "RUB", today.plusDays(2), RecurrenceType.MONTHLY, null));

        var snapshot = latest(accountId);
        assertEquals(4, snapshot.revision());
        assertEquals(new AccountSnapshot.TransactionLine(today.minusDays(1), new BigDecimal("1000.00"), "IN"),
                snapshot.transactions().get(0));
        assertEquals(new AccountSnapshot.InvoiceLine(today.plusDays(1), new BigDecimal("250.00"), "ISSUED"),
                snapshot.invoices().get(0));
        assertEquals(new AccountSnapshot.ObligationLine(today.plusDays(2), new BigDecimal("125.00"), "MONTHLY", true),
                snapshot.obligations().get(0));

        transactions.deleteTransaction(transaction.getId());
        assertTrue(latest(accountId).transactions().isEmpty());
        invoices.deleteInvoice(invoice.getId());
        assertTrue(latest(accountId).invoices().isEmpty());
        obligations.deleteObligation(obligation.getId());
        assertTrue(latest(accountId).obligations().isEmpty());
        accounts.deleteCashAccount(accountId);

        var deleted = latest(accountId);
        assertEquals(8, deleted.revision());
        assertTrue(deleted.deleted());
        assertNull(deleted.currency());
        assertTrue(deleted.transactions().isEmpty());
        assertTrue(deleted.invoices().isEmpty());
        assertTrue(deleted.obligations().isEmpty());
        assertEquals(8L, countEvents(accountId));
        assertEquals(0L, jdbc.queryForObject("SELECT count(*) FROM cash_accounts WHERE id = ?", Long.class, accountId));
        assertEquals(0L, jdbc.queryForObject("SELECT count(*) FROM account_outbox WHERE published_at IS NOT NULL", Long.class));
    }

    @Test
    void rollsBackBusinessDataRevisionAndEventTogether() throws Exception {
        long accountId = createAccount();
        var transaction = new TransactionTemplate(transactionManager);

        assertThrows(IllegalStateException.class, () -> transaction.executeWithoutResult(status -> {
            transactions.createTransaction(transaction(accountId, "45.00", LocalDate.of(2026, 10, 6)));
            throw new IllegalStateException("Abort the business transaction");
        }));

        assertEquals(0L, jdbc.queryForObject("SELECT count(*) FROM bank_transactions", Long.class));
        assertEquals(1L, countEvents(accountId));
        assertEquals(1L, jdbc.queryForObject("SELECT revision FROM account_revisions WHERE account_id = ?", Long.class, accountId));
        assertEquals(1, latest(accountId).revision());

        transactions.createTransaction(transaction(accountId, "70.00", LocalDate.of(2026, 10, 6)));
        assertEquals(2, latest(accountId).revision());
        assertEquals(2L, countEvents(accountId));
        money("70.00", latest(accountId).transactions().get(0).amount());
    }

    @Test
    void serializesConcurrentAccountChangesWithoutLosingSnapshotInputs() throws Exception {
        long accountId = createAccount();
        var start = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        try {
            var first = executor.submit(() -> {
                start.await();
                return transactions.createTransaction(transaction(accountId, "10.00", LocalDate.of(2026, 10, 6)));
            });
            var second = executor.submit(() -> {
                start.await();
                return transactions.createTransaction(transaction(accountId, "20.00", LocalDate.of(2026, 10, 6)));
            });
            start.countDown();
            assertNotEquals(first.get(20, TimeUnit.SECONDS).getId(), second.get(20, TimeUnit.SECONDS).getId());
        } finally {
            executor.shutdownNow();
        }

        var snapshot = latest(accountId);
        assertEquals(3, snapshot.revision());
        assertEquals(3L, countEvents(accountId));
        assertEquals(2, snapshot.transactions().size());
        money("30.00", snapshot.transactions().stream()
                .map(AccountSnapshot.TransactionLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    @Test
    void demoSeedPublishesAllForecastInputsAndBootstrapDoesNotDuplicateThem() throws Exception {
        demoProperties.setSeedOnStartup(true);
        try {
            demoSeed.seedIfConfiguredAndEmpty();
        } finally {
            demoProperties.setSeedOnStartup(false);
        }
        long accountId = jdbc.queryForObject("SELECT id FROM cash_accounts", Long.class);
        var snapshot = latest(accountId);
        assertEquals("USD", snapshot.currency());
        assertEquals(4, snapshot.invoices().size());
        assertEquals(3, snapshot.obligations().size());
        assertEquals(jdbc.queryForObject("SELECT count(*) FROM bank_transactions", Integer.class),
                snapshot.transactions().size());

        LocalDate today = LocalDate.now();
        BigDecimal snapshotOpening = snapshot.transactions().stream()
                .filter(line -> line.bookedAt().isBefore(today))
                .map(line -> line.direction().equals("IN") ? line.amount() : line.amount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        var baseline = forecast.generateForecast(accountId, today, 15);
        assertEquals(0, snapshotOpening.compareTo(baseline.get(0).getOpeningBalance()));
        money("18250.00", baseline.get(0).getExpectedIn());
        money("38500.00", baseline.get(2).getExpectedOut());
        money("3200.00", baseline.get(4).getExpectedOut());
        money("11800.00", baseline.get(9).getExpectedOut());
        money("47500.00", baseline.get(14).getExpectedIn());
        money("18250.00", snapshot.invoices().stream().filter(line -> line.status().equals("OVERDUE"))
                .map(AccountSnapshot.InvoiceLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add));
        money("47500.00", snapshot.invoices().stream()
                .filter(line -> line.status().equals("ISSUED") && line.dueDate().equals(today.plusDays(14)))
                .map(AccountSnapshot.InvoiceLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add));

        bootstrap.seedExistingAccounts();
        assertEquals(1L, countEvents(accountId));
        assertEquals(1, latest(accountId).revision());
    }

    private long createAccount() {
        var company = companies.save(new Company("Outbox Test", "OUTBOX-001"));
        return accounts.createCashAccount(new CreateCashAccountRequest(company.getId(), "Operating", null, "RUB")).getId();
    }

    private CreateBankTransactionRequest transaction(long accountId, String amount, LocalDate date) {
        return new CreateBankTransactionRequest(accountId, date, new BigDecimal(amount), "RUB",
                TransactionDirection.IN, "Payment", null);
    }

    private AccountSnapshot latest(long accountId) throws Exception {
        String payload = jdbc.queryForObject("SELECT payload FROM account_outbox WHERE account_id = ? " +
                "ORDER BY revision DESC LIMIT 1", String.class, accountId);
        return mapper.readValue(payload, AccountSnapshot.class);
    }

    private long countEvents(long accountId) {
        return jdbc.queryForObject("SELECT count(*) FROM account_outbox WHERE account_id = ?", Long.class, accountId);
    }

    private static void money(String expected, BigDecimal actual) {
        assertEquals(0, new BigDecimal(expected).compareTo(actual));
    }
}
