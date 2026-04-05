package com.cashflow.autopilot.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCompanyRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String taxId;

    public CreateCompanyRequest() {}

    public CreateCompanyRequest(String name, String taxId) {
        this.name = name;
        this.taxId = taxId;
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
}
