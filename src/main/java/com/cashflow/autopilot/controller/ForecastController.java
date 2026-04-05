package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.DashboardSummaryDTO;
import com.cashflow.autopilot.dto.ForecastPointDTO;
import com.cashflow.autopilot.service.DashboardService;
import com.cashflow.autopilot.service.ForecastService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ForecastController {

    private final ForecastService forecastService;
    private final DashboardService dashboardService;

    public ForecastController(ForecastService forecastService, DashboardService dashboardService) {
        this.forecastService = forecastService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<ForecastPointDTO>> getForecast(
            @RequestParam Long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(defaultValue = "91") int days) {

        List<ForecastPointDTO> forecast = forecastService.generateForecast(cashAccountId, startDate, days);
        return ResponseEntity.ok(forecast);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
            @RequestParam Long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(defaultValue = "91") int days) {

        DashboardSummaryDTO summary = dashboardService.getSummary(cashAccountId, startDate, days);
        return ResponseEntity.ok(summary);
    }
}
