package com.cashflow.autopilot.service;

import com.cashflow.autopilot.dto.DashboardSummaryDTO;
import com.cashflow.autopilot.dto.ForecastPointDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final ForecastService forecastService;
    private final BankTransactionService bankTransactionService;

    public DashboardService(
            ForecastService forecastService,
            BankTransactionService bankTransactionService) {
        this.forecastService = forecastService;
        this.bankTransactionService = bankTransactionService;
    }

    public DashboardSummaryDTO getSummary(Long cashAccountId, LocalDate startDate, int days) {
        List<ForecastPointDTO> forecast = forecastService.generateForecast(cashAccountId, startDate, days);

        if (forecast.isEmpty()) {
            return new DashboardSummaryDTO(BigDecimal.ZERO, BigDecimal.ZERO, null, null);
        }

        BigDecimal cashNow = bankTransactionService.calculateBalanceBefore(cashAccountId, LocalDate.now());

        BigDecimal minCash = forecast.get(0).getOpeningBalance();
        LocalDate minCashDate = null;
        Integer runwayDays = null;

        for (int i = 0; i < forecast.size(); i++) {
            ForecastPointDTO point = forecast.get(i);
            if (point.getClosingBalance().compareTo(minCash) < 0) {
                minCash = point.getClosingBalance();
                minCashDate = point.getDate();
            }

            if (runwayDays == null && point.getClosingBalance().compareTo(BigDecimal.ZERO) < 0) {
                runwayDays = i + 1;
            }
        }

        return new DashboardSummaryDTO(cashNow, minCash, minCashDate, runwayDays);
    }
}
