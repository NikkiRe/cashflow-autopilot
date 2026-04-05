package com.cashflow.autopilot.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DashboardSummaryDTO {
    private BigDecimal cashNow;
    private BigDecimal minCash;
    private LocalDate minCashDate;
    private Integer runwayDays;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal cashNow, BigDecimal minCash, LocalDate minCashDate, Integer runwayDays) {
        this.cashNow = cashNow;
        this.minCash = minCash;
        this.minCashDate = minCashDate;
        this.runwayDays = runwayDays;
    }

    public BigDecimal getCashNow() {
        return cashNow;
    }

    public void setCashNow(BigDecimal cashNow) {
        this.cashNow = cashNow;
    }

    public BigDecimal getMinCash() {
        return minCash;
    }

    public void setMinCash(BigDecimal minCash) {
        this.minCash = minCash;
    }

    public LocalDate getMinCashDate() {
        return minCashDate;
    }

    public void setMinCashDate(LocalDate minCashDate) {
        this.minCashDate = minCashDate;
    }

    public Integer getRunwayDays() {
        return runwayDays;
    }

    public void setRunwayDays(Integer runwayDays) {
        this.runwayDays = runwayDays;
    }
}
