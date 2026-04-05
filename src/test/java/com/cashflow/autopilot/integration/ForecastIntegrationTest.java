package com.cashflow.autopilot.integration;

import com.cashflow.autopilot.CashflowAutopilotApplication;
import com.cashflow.autopilot.domain.entity.*;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import com.cashflow.autopilot.domain.enums.RecurrenceType;
import com.cashflow.autopilot.domain.enums.TransactionDirection;
import com.cashflow.autopilot.dto.ForecastPointDTO;
import com.cashflow.autopilot.repository.BankTransactionRepository;
import com.cashflow.autopilot.repository.CashAccountRepository;
import com.cashflow.autopilot.repository.CompanyRepository;
import com.cashflow.autopilot.repository.CounterpartyRepository;
import com.cashflow.autopilot.repository.InvoiceRepository;
import com.cashflow.autopilot.repository.ObligationRepository;
import com.cashflow.autopilot.service.ForecastService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = CashflowAutopilotApplication.class)
@Testcontainers
class ForecastIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("cashflow_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ForecastService forecastService;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CashAccountRepository cashAccountRepository;

    @Autowired
    private BankTransactionRepository transactionRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ObligationRepository obligationRepository;

    @Autowired
    private CounterpartyRepository counterpartyRepository;

    private CashAccount testAccount;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        invoiceRepository.deleteAll();
        obligationRepository.deleteAll();
        cashAccountRepository.deleteAll();
        counterpartyRepository.deleteAll();
        companyRepository.deleteAll();

        Company company = new Company("Test Company", "123456789");
        company = companyRepository.save(company);

        testAccount = new CashAccount(company, "Main Account", "RUB");
        testAccount = cashAccountRepository.save(testAccount);
    }

    @Test
    void testForecastWithOpeningBalance() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BankTransaction transaction = new BankTransaction(
                testAccount,
                yesterday,
                new BigDecimal("10000.00"),
                "RUB",
                TransactionDirection.IN,
                "Initial deposit"
        );
        transactionRepository.save(transaction);

        LocalDate startDate = LocalDate.now();
        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 7);

        assertFalse(forecast.isEmpty());
        assertEquals(startDate, forecast.get(0).getDate());
        assertEquals(0, new BigDecimal("10000.00").compareTo(forecast.get(0).getOpeningBalance()));
    }

    @Test
    void testForecastWithInvoice() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BankTransaction transaction = new BankTransaction(
                testAccount,
                yesterday,
                new BigDecimal("10000.00"),
                "RUB",
                TransactionDirection.IN,
                "Initial deposit"
        );
        transactionRepository.save(transaction);

        LocalDate dueDate = LocalDate.now().plusDays(3);
        Invoice invoice = new Invoice(
                testAccount,
                "INV-001",
                LocalDate.now(),
                dueDate,
                new BigDecimal("2500.00"),
                "RUB",
                InvoiceStatus.ISSUED
        );
        invoiceRepository.save(invoice);

        LocalDate startDate = LocalDate.now();
        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 7);

        assertEquals(7, forecast.size());
        ForecastPointDTO day4 = forecast.get(3);
        assertEquals(dueDate, day4.getDate());
        assertEquals(0, new BigDecimal("2500.00").compareTo(day4.getExpectedIn()));
        assertEquals(0, new BigDecimal("12500.00").compareTo(day4.getClosingBalance()));
    }

    @Test
    void testForecastWithObligation() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BankTransaction transaction = new BankTransaction(
                testAccount,
                yesterday,
                new BigDecimal("10000.00"),
                "RUB",
                TransactionDirection.IN,
                "Initial deposit"
        );
        transactionRepository.save(transaction);

        LocalDate dueDate = LocalDate.now().plusDays(2);
        Obligation obligation = new Obligation(
                testAccount,
                "Payroll",
                new BigDecimal("3000.00"),
                "RUB",
                dueDate,
                RecurrenceType.NONE
        );
        obligationRepository.save(obligation);

        LocalDate startDate = LocalDate.now();
        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 7);

        assertEquals(7, forecast.size());
        ForecastPointDTO day3 = forecast.get(2);
        assertEquals(dueDate, day3.getDate());
        assertEquals(0, new BigDecimal("3000.00").compareTo(day3.getExpectedOut()));
        assertEquals(0, new BigDecimal("7000.00").compareTo(day3.getClosingBalance()));
    }

    @Test
    void testForecastWithWeeklyObligation() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BankTransaction transaction = new BankTransaction(
                testAccount,
                yesterday,
                new BigDecimal("10000.00"),
                "RUB",
                TransactionDirection.IN,
                "Initial deposit"
        );
        transactionRepository.save(transaction);

        LocalDate startDate = LocalDate.now();
        LocalDate dueDate = startDate.plusDays(2);
        Obligation obligation = new Obligation(
                testAccount,
                "Weekly Payment",
                new BigDecimal("1000.00"),
                "RUB",
                dueDate,
                RecurrenceType.WEEKLY
        );
        obligationRepository.save(obligation);

        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 14);

        assertEquals(14, forecast.size());

        ForecastPointDTO day3 = forecast.get(2);
        assertEquals(dueDate, day3.getDate());
        assertEquals(0, new BigDecimal("1000.00").compareTo(day3.getExpectedOut()));
        assertEquals(0, new BigDecimal("9000.00").compareTo(day3.getClosingBalance()));

        ForecastPointDTO day10 = forecast.get(9);
        assertEquals(0, new BigDecimal("1000.00").compareTo(day10.getExpectedOut()));
        assertEquals(0, new BigDecimal("8000.00").compareTo(day10.getClosingBalance()));
    }

    @Test
    void testForecastWithNoTransactions() {
        LocalDate startDate = LocalDate.now();
        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 5);

        assertFalse(forecast.isEmpty());
        assertEquals(0, new BigDecimal("0").compareTo(forecast.get(0).getOpeningBalance()));
    }

    @Test
    void testForecastRunWithNegativeBalance() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BankTransaction transaction = new BankTransaction(
                testAccount,
                yesterday,
                new BigDecimal("1000.00"),
                "RUB",
                TransactionDirection.IN,
                "Initial deposit"
        );
        transactionRepository.save(transaction);

        LocalDate dueDate = LocalDate.now().plusDays(2);
        Obligation obligation = new Obligation(
                testAccount,
                "Large Payment",
                new BigDecimal("3000.00"),
                "RUB",
                dueDate,
                RecurrenceType.NONE
        );
        obligationRepository.save(obligation);

        LocalDate startDate = LocalDate.now();
        List<ForecastPointDTO> forecast = forecastService.generateForecast(
                testAccount.getId(), startDate, 5);

        ForecastPointDTO day3 = forecast.get(2);
        assertEquals(0, new BigDecimal("-2000.00").compareTo(day3.getClosingBalance()));
        assertTrue(day3.getClosingBalance().compareTo(BigDecimal.ZERO) < 0);
    }
}
