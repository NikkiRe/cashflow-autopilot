package com.cashflow.autopilot.dto;

import java.time.LocalDateTime;

public class CashAccountDTO {
    private Long id;
    private Long companyId;
    private String name;
    private String accountNumber;
    private String currency;
    private Boolean active;
    private LocalDateTime createdAt;

    public CashAccountDTO() {}

    public CashAccountDTO(Long id, Long companyId, String name, String accountNumber,
                          String currency, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.accountNumber = accountNumber;
        this.currency = currency;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
