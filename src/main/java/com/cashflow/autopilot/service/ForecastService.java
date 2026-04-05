package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.Invoice;
import com.cashflow.autopilot.domain.entity.Obligation;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import com.cashflow.autopilot.domain.enums.RecurrenceType;
import com.cashflow.autopilot.dto.ForecastPointDTO;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.CashAccountRepository;
import com.cashflow.autopilot.repository.InvoiceRepository;
import com.cashflow.autopilot.repository.ObligationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ForecastService {

    private final CashAccountRepository cashAccountRepository;
    private final InvoiceRepository invoiceRepository;
    private final ObligationRepository obligationRepository;
    private final BankTransactionService bankTransactionService;

    public ForecastService(CashAccountRepository cashAccountRepository,
                           InvoiceRepository invoiceRepository,
                           ObligationRepository obligationRepository,
                           BankTransactionService bankTransactionService) {
        this.cashAccountRepository = cashAccountRepository;
        this.invoiceRepository = invoiceRepository;
        this.obligationRepository = obligationRepository;
        this.bankTransactionService = bankTransactionService;
    }

    public List<ForecastPointDTO> generateForecast(Long cashAccountId, LocalDate startDate, int days) {
        if (!cashAccountRepository.existsById(cashAccountId)) {
            throw new NotFoundException("Cash account not found with id: " + cashAccountId);
        }

        List<ForecastPointDTO> forecast = new ArrayList<>();

        LocalDate dayBeforeStart = startDate.minusDays(1);
        BigDecimal currentBalance = bankTransactionService.calculateBalanceBefore(cashAccountId, dayBeforeStart);

        List<Obligation> obligations = obligationRepository.findByCashAccountIdAndActiveTrue(cashAccountId);

        for (int dayOffset = 0; dayOffset < days; dayOffset++) {
            LocalDate currentDate = startDate.plusDays(dayOffset);

            BigDecimal expectedIn = calculateExpectedIn(cashAccountId, currentDate, startDate, dayOffset);

            BigDecimal expectedOut = calculateExpectedOut(obligations, currentDate);

            BigDecimal openingBalance = currentBalance;
            BigDecimal closingBalance = currentBalance.add(expectedIn).subtract(expectedOut);

            forecast.add(new ForecastPointDTO(currentDate, openingBalance, expectedIn, expectedOut, closingBalance));

            currentBalance = closingBalance;
        }

        return forecast;
    }

    private BigDecimal calculateExpectedIn(Long cashAccountId, LocalDate date, LocalDate forecastStart, int dayOffset) {
        List<Invoice> dueToday = invoiceRepository.findIssuedByCashAccountIdAndDueDate(cashAccountId, date);
        BigDecimal sum = dueToday.stream()
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (dayOffset == 0) {
            List<Invoice> overdue = invoiceRepository.findByCashAccountIdAndStatus(cashAccountId, InvoiceStatus.OVERDUE);
            sum = sum.add(overdue.stream()
                    .map(Invoice::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
        }
        return sum;
    }

    private BigDecimal calculateExpectedOut(List<Obligation> obligations, LocalDate date) {
        return obligations.stream()
                .filter(obligation -> isObligationDueOn(obligation, date))
                .map(Obligation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isObligationDueOn(Obligation obligation, LocalDate date) {
        if (date.isBefore(obligation.getNextDueDate())) {
            return false;
        }

        switch (obligation.getRecurrence()) {
            case NONE:
                return date.equals(obligation.getNextDueDate());

            case WEEKLY:
                long daysSince = ChronoUnit.DAYS.between(obligation.getNextDueDate(), date);
                return daysSince >= 0 && daysSince % 7 == 0;

            case MONTHLY:
                return isSameDayOfMonth(obligation.getNextDueDate(), date);

            default:
                return false;
        }
    }

    private boolean isSameDayOfMonth(LocalDate startDate, LocalDate date) {
        if (date.isBefore(startDate)) {
            return false;
        }

        int dayOfMonth = startDate.getDayOfMonth();
        int targetDay = dayOfMonth;

        int currentDay = date.getDayOfMonth();

        int lastDayOfMonth = YearMonth.from(date).lengthOfMonth();

        if (dayOfMonth > lastDayOfMonth) {
            targetDay = lastDayOfMonth;
        }

        return currentDay == targetDay;
    }
}
