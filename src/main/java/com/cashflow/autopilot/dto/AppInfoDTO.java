package com.cashflow.autopilot.dto;

public record AppInfoDTO(
        boolean demoEnabled,
        boolean presentationMode,
        boolean noRealFunds,
        String disclaimer,
        String currencyLabel,
        boolean sampleDatasetSeededThisStartup
) {}
