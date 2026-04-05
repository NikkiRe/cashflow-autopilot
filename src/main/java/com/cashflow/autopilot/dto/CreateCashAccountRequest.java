package com.cashflow.autopilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CreateCashAccountRequest {
    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Name is required")
    private String name;

    private String accountNumber;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
    private String currency;

    public CreateCashAccountRequest() {}

    public CreateCashAccountRequest(Long companyId, String name, String accountNumber, String currency) {
        this.companyId = companyId;
        this.name = name;
        this.accountNumber = accountNumber;
        this.currency = currency;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
