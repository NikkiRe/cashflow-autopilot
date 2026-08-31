package com.cashflow.autopilot.service;

import com.cashflow.autopilot.config.DemoPresentationState;
import com.cashflow.autopilot.events.AccountOutbox;
import com.cashflow.autopilot.config.DemoProperties;
import com.cashflow.autopilot.domain.entity.*;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import com.cashflow.autopilot.domain.enums.RecurrenceType;
import com.cashflow.autopilot.domain.enums.TransactionDirection;
import com.cashflow.autopilot.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class DemoDataSeedService {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeedService.class);

    public static final String DEMO_COMPANY_NAME = "Northwind Demo Ltd";

    private final DemoProperties demoProperties;
    private final AccountOutbox outbox;
    private final DemoPresentationState presentationState;
    private final CompanyRepository companyRepository;
    private final CashAccountRepository cashAccountRepository;
    private final CounterpartyRepository counterpartyRepository;
    private final InvoiceRepository invoiceRepository;
    private final ObligationRepository obligationRepository;
    private final BankTransactionRepository bankTransactionRepository;

    public DemoDataSeedService(
            DemoProperties demoProperties,
            DemoPresentationState presentationState,
            CompanyRepository companyRepository,
            CashAccountRepository cashAccountRepository,
            CounterpartyRepository counterpartyRepository,
            InvoiceRepository invoiceRepository,
            ObligationRepository obligationRepository,
            BankTransactionRepository bankTransactionRepository, AccountOutbox outbox) {
        this.demoProperties = demoProperties;
        this.outbox = outbox;
        this.presentationState = presentationState;
        this.companyRepository = companyRepository;
        this.cashAccountRepository = cashAccountRepository;
        this.counterpartyRepository = counterpartyRepository;
        this.invoiceRepository = invoiceRepository;
        this.obligationRepository = obligationRepository;
        this.bankTransactionRepository = bankTransactionRepository;
    }

    @Transactional
    public void seedIfConfiguredAndEmpty() {
        if (!demoProperties.isEnabled() || !demoProperties.isSeedOnStartup()) {
            return;
        }
        if (companyRepository.count() > 0) {
            return;
        }

        log.info("Seeding presentation dataset ({}) — no companies in database", DEMO_COMPANY_NAME);

        Company company = companyRepository.save(new Company(DEMO_COMPANY_NAME, "DEM-0000001"));

        CashAccount main = new CashAccount(company, "Operating — Primary", "USD");
        main.setAccountNumber("····1001");
        main = cashAccountRepository.save(main);

        Counterparty acme = counterpartyRepository.save(counterparty("Acme Digital Ltd", company, "CLIENT", "ar@acme.demo"));
        Counterparty beta = counterpartyRepository.save(counterparty("Beta Retail Group", company, "CLIENT", "ap@beta.demo"));
        counterpartyRepository.save(counterparty("CloudStack Vendor", company, "VENDOR", "billing@cloudstack.demo"));

        LocalDate today = LocalDate.now();

        persistInvoice(main, acme, "INV-2025-0142", today.minusDays(8), today.plusDays(14),
                new BigDecimal("47500.00"), InvoiceStatus.ISSUED, "Milestone — platform integration");
        persistInvoice(main, beta, "INV-2025-0143", today.minusDays(3), today.plusDays(41),
                new BigDecimal("128000.00"), InvoiceStatus.ISSUED, "Annual licence renewal");
        persistInvoice(main, acme, "INV-2025-0098", today.minusDays(45), today.minusDays(6),
                new BigDecimal("18250.00"), InvoiceStatus.OVERDUE, "Support retainer Q4");
        persistInvoice(main, beta, "INV-2024-0881", today.minusDays(72), today.minusDays(40),
                new BigDecimal("64000.00"), InvoiceStatus.PAID, "Hardware rollout (settled)");

        persistObligation(main, "HQ & engineering rent", new BigDecimal("11800.00"), today.plusDays(9), RecurrenceType.MONTHLY,
                "Class A lease — simulated");
        persistObligation(main, "Cloud & SaaS stack", new BigDecimal("3200.00"), today.plusDays(4), RecurrenceType.MONTHLY,
                "AWS, data, observability");
        persistObligation(main, "Payroll & benefits", new BigDecimal("38500.00"), today.plusDays(2), RecurrenceType.MONTHLY,
                "Semi-monthly payroll cycle");

        seedBankHistory(main, today);
        outbox.lock(main.getId());
        outbox.snapshot(main.getId());

        presentationState.markSampleDatasetSeeded();
        log.info("Presentation seed complete: company id={}, main cash account id={}", company.getId(), main.getId());
    }

    private static Counterparty counterparty(String name, Company company, String type, String email) {
        Counterparty c = new Counterparty(name);
        c.setCompany(company);
        c.setType(type);
        c.setContactEmail(email);
        return c;
    }

    private void persistInvoice(
            CashAccount account,
            Counterparty counterparty,
            String number,
            LocalDate issue,
            LocalDate due,
            BigDecimal amount,
            InvoiceStatus status,
            String description) {
        Invoice invoice = new Invoice();
        invoice.setCashAccount(account);
        invoice.setCounterparty(counterparty);
        invoice.setInvoiceNumber(number);
        invoice.setIssueDate(issue);
        invoice.setDueDate(due);
        invoice.setAmount(amount);
        invoice.setCurrency("USD");
        invoice.setStatus(status);
        invoice.setDescription(description);
        invoiceRepository.save(invoice);
    }

    private void persistObligation(
            CashAccount account,
            String name,
            BigDecimal amount,
            LocalDate nextDue,
            RecurrenceType recurrence,
            String description) {
        Obligation o = new Obligation(account, name, amount, "USD", nextDue, recurrence);
        o.setDescription(description);
        o.setActive(true);
        obligationRepository.save(o);
    }

    private void seedBankHistory(CashAccount account, LocalDate today) {
        bankTransaction(account, today.minusDays(100), new BigDecimal("238000.00"), TransactionDirection.IN,
                "Operating reserve — treasury sweep (demo)");
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        for (int back = 75; back >= 1; back--) {
            if (back % 9 == 0 && rnd.nextBoolean()) {
                BigDecimal inflow = BigDecimal.valueOf(rnd.nextInt(8000, 35000)).setScale(2, RoundingMode.HALF_UP);
                bankTransaction(account, today.minusDays(back), inflow, TransactionDirection.IN, "Incoming — client remittance");
            } else if (back % 5 == 0) {
                BigDecimal outflow = BigDecimal.valueOf(rnd.nextInt(1200, 9000)).setScale(2, RoundingMode.HALF_UP);
                bankTransaction(account, today.minusDays(back), outflow, TransactionDirection.OUT, "Operating outflow");
            }
        }
        bankTransaction(account, today.minusDays(1), new BigDecimal("15000.00"), TransactionDirection.IN, "Wire — project prepayment");
    }

    private void bankTransaction(
            CashAccount account,
            LocalDate bookedAt,
            BigDecimal amount,
            TransactionDirection direction,
            String description) {
        BankTransaction tx = new BankTransaction(account, bookedAt, amount, "USD", direction, description);
        tx.setReferenceNumber("DEMO-" + bookedAt + "-" + direction.name());
        bankTransactionRepository.save(tx);
    }
}
