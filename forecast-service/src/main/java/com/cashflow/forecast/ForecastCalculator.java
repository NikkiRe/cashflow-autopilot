package com.cashflow.forecast;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class ForecastCalculator {
    public List<Point> forecast(AccountSnapshot account, LocalDate startDate, int days) {
        if (days < 1 || days > 366) {
            throw new IllegalArgumentException("Forecast horizon must be between 1 and 366 days");
        }
        BigDecimal balance = balanceBefore(account, startDate.minusDays(1));
        var result = new ArrayList<Point>(days);
        for (int offset = 0; offset < days; offset++) {
            LocalDate date = startDate.plusDays(offset);
            BigDecimal incoming = account.invoices().stream()
                    .filter(i -> (i.status().equals("ISSUED") && i.dueDate().equals(date)) ||
                            (i.status().equals("OVERDUE") && date.equals(startDate)))
                    .map(AccountSnapshot.InvoiceLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal outgoing = account.obligations().stream().filter(o -> o.active() && due(o, date))
                    .map(AccountSnapshot.ObligationLine::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal closing = balance.add(incoming).subtract(outgoing);
            result.add(new Point(date, balance, incoming, outgoing, closing));
            balance = closing;
        }
        return result;
    }

    public Summary summary(AccountSnapshot account, List<Point> forecast, LocalDate today) {
        BigDecimal minimum = forecast.getFirst().openingBalance();
        LocalDate minimumDate = null;
        Integer runway = null;
        for (int i = 0; i < forecast.size(); i++) {
            Point point = forecast.get(i);
            if (point.closingBalance().compareTo(minimum) < 0) {
                minimum = point.closingBalance();
                minimumDate = point.date();
            }
            if (runway == null && point.closingBalance().signum() < 0) {
                runway = i + 1;
            }
        }
        return new Summary(balanceBefore(account, today), minimum, minimumDate, runway);
    }

    private BigDecimal balanceBefore(AccountSnapshot account, LocalDate date) {
        return account.transactions().stream().filter(t -> !t.bookedAt().isAfter(date))
                .map(t -> t.direction().equals("IN") ? t.amount() : t.amount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean due(AccountSnapshot.ObligationLine obligation, LocalDate date) {
        LocalDate first = obligation.nextDueDate();
        if (date.isBefore(first)) {
            return false;
        }
        return switch (obligation.recurrence()) {
            case "NONE" -> date.equals(first);
            case "WEEKLY" -> ChronoUnit.DAYS.between(first, date) % 7 == 0;
            case "MONTHLY" -> date.getDayOfMonth() == Math.min(first.getDayOfMonth(), YearMonth.from(date).lengthOfMonth());
            default -> throw new IllegalArgumentException("Unknown recurrence: " + obligation.recurrence());
        };
    }

    public record Point(LocalDate date, BigDecimal openingBalance, BigDecimal expectedIn,
                        BigDecimal expectedOut, BigDecimal closingBalance) {}
    public record Summary(BigDecimal cashNow, BigDecimal minCash, LocalDate minCashDate, Integer runwayDays) {}
}
