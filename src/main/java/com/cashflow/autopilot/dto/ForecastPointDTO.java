package com.cashflow.autopilot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ForecastPointDTO {
    private LocalDate date;
    private BigDecimal openingBalance;
    private BigDecimal expectedIn;
    private BigDecimal expectedOut;
    private BigDecimal closingBalance;

    public ForecastPointDTO() {}

    public ForecastPointDTO(LocalDate date, BigDecimal openingBalance, BigDecimal expectedIn,
                            BigDecimal expectedOut, BigDecimal closingBalance) {
        this.date = date;
        this.openingBalance = openingBalance;
        this.expectedIn = expectedIn;
        this.expectedOut = expectedOut;
        this.closingBalance = closingBalance;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }

    public BigDecimal getExpectedIn() {
        return expectedIn;
    }

    public void setExpectedIn(BigDecimal expectedIn) {
        this.expectedIn = expectedIn;
    }

    public BigDecimal getExpectedOut() {
        return expectedOut;
    }

    public void setExpectedOut(BigDecimal expectedOut) {
        this.expectedOut = expectedOut;
    }

    public BigDecimal getClosingBalance() {
        return closingBalance;
    }

    public void setClosingBalance(BigDecimal closingBalance) {
        this.closingBalance = closingBalance;
    }
}
