package com.cashflow.forecast;

import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ForecastController {
    private final AccountProjection projection;
    private final ForecastCalculator calculator;

    public ForecastController(AccountProjection projection, ForecastCalculator calculator) {
        this.projection = projection;
        this.calculator = calculator;
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<ForecastCalculator.Point>> forecast(@RequestParam long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, @RequestParam(defaultValue = "91") int days) {
        var account = projection.get(cashAccountId);
        return ResponseEntity.ok().header("X-Projection-Revision", Long.toString(account.revision()))
                .body(calculator.forecast(account, startDate, days));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ForecastCalculator.Summary> summary(@RequestParam long cashAccountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate, @RequestParam(defaultValue = "91") int days) {
        var account = projection.get(cashAccountId);
        var points = calculator.forecast(account, startDate, days);
        return ResponseEntity.ok().header("X-Projection-Revision", Long.toString(account.revision()))
                .body(calculator.summary(account, points, LocalDate.now()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> invalidRequest(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
    }
}
