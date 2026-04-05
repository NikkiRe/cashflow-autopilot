package com.cashflow.autopilot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cashflow.demo")
public class DemoProperties {

    private boolean enabled = true;

    private boolean seedOnStartup = true;

    private boolean presentationMode = true;

    private String disclaimer = "All monetary figures are simulated for demonstration. No real funds or payment rails are connected.";

    private String currencyLabel = "USD (simulated)";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isSeedOnStartup() {
        return seedOnStartup;
    }

    public void setSeedOnStartup(boolean seedOnStartup) {
        this.seedOnStartup = seedOnStartup;
    }

    public boolean isPresentationMode() {
        return presentationMode;
    }

    public void setPresentationMode(boolean presentationMode) {
        this.presentationMode = presentationMode;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public String getCurrencyLabel() {
        return currencyLabel;
    }

    public void setCurrencyLabel(String currencyLabel) {
        this.currencyLabel = currencyLabel;
    }
}
