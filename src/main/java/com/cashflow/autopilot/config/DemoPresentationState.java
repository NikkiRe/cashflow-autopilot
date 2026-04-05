package com.cashflow.autopilot.config;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class DemoPresentationState {

    private final AtomicBoolean sampleDatasetSeededThisStartup = new AtomicBoolean(false);

    public void markSampleDatasetSeeded() {
        sampleDatasetSeededThisStartup.set(true);
    }

    public boolean isSampleDatasetSeededThisStartup() {
        return sampleDatasetSeededThisStartup.get();
    }
}
