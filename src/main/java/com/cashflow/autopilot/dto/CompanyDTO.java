package com.cashflow.autopilot.dto;

import java.time.LocalDateTime;

public class CompanyDTO {
    private Long id;
    private String name;
    private String taxId;
    private LocalDateTime createdAt;

    public CompanyDTO() {}

    public CompanyDTO(Long id, String name, String taxId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.taxId = taxId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
