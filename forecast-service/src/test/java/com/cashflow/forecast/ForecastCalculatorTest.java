package com.cashflow.forecast;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class ForecastCalculatorTest {
    private final ForecastCalculator calculator = new ForecastCalculator();
    private final LocalDate start = LocalDate.of(2026, 1, 30);

    @Test
    void preservesDailyForecastRulesIncludingMonthEndAndOverdueInvoices() {
        var account = new AccountSnapshot(1, UUID.randomUUID(), 1, 1, false, "RUB",
                List.of(new AccountSnapshot.InvoiceLine(start.plusDays(1), money(250), "ISSUED"),
                        new AccountSnapshot.InvoiceLine(start.minusDays(1), money(100), "OVERDUE"),
                        new AccountSnapshot.InvoiceLine(start, money(900), "PAID")),
                List.of(new AccountSnapshot.ObligationLine(start, money(70), "WEEKLY", true),
                        new AccountSnapshot.ObligationLine(start.plusDays(1), money(300), "MONTHLY", true),
                        new AccountSnapshot.ObligationLine(start.plusDays(2), money(50), "NONE", true),
                        new AccountSnapshot.ObligationLine(start, money(900), "NONE", false)),
                List.of(new AccountSnapshot.TransactionLine(start.minusDays(2), money(1500), "IN"),
                        new AccountSnapshot.TransactionLine(start.minusDays(1), money(500), "OUT"),
                        new AccountSnapshot.TransactionLine(start, money(9999), "IN")));

        var points = calculator.forecast(account, start, 30);

        assertThat(points.getFirst()).isEqualTo(new ForecastCalculator.Point(start, money(1000), money(100), money(70), money(1030)));
        assertThat(points.get(1).closingBalance()).isEqualByComparingTo("980");
        assertThat(points.get(2).closingBalance()).isEqualByComparingTo("930");
        assertThat(points.get(7).expectedOut()).isEqualByComparingTo("70");
        assertThat(points.get(29).date()).isEqualTo(LocalDate.of(2026, 2, 28));
        assertThat(points.get(29).expectedOut()).isEqualByComparingTo("300");
        assertThat(points.get(29).closingBalance()).isEqualByComparingTo("350");
        var summary = calculator.summary(account, points, start);
        assertThat(summary.cashNow()).isEqualByComparingTo("10999");
        assertThat(summary.minCash()).isEqualByComparingTo("350");
        assertThat(summary.runwayDays()).isNull();
    }

    @Test
    void rejectsUnboundedOrEmptyForecasts() {
        var account = new AccountSnapshot(1, UUID.randomUUID(), 1, 1, false, "RUB", List.of(), List.of(), List.of());
        assertThatThrownBy(() -> calculator.forecast(account, start, 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> calculator.forecast(account, start, 367)).isInstanceOf(IllegalArgumentException.class);
        assertThat(calculator.forecast(account, start, 366)).hasSize(366);
    }

    private BigDecimal money(long amount) {
        return BigDecimal.valueOf(amount);
    }
}
