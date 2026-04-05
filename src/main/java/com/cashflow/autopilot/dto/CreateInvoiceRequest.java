package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateInvoiceRequest {
    @NotNull(message = "Cash account ID is required")
    private Long cashAccountId;

    private Long counterpartyId;

    private String invoiceNumber;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Currency is required")
    private String currency;

    @NotNull(message = "Status is required")
    private InvoiceStatus status;

    private String description;

    public CreateInvoiceRequest() {}

    public CreateInvoiceRequest(Long cashAccountId, Long counterpartyId, String invoiceNumber,
                                LocalDate issueDate, LocalDate dueDate, BigDecimal amount,
                                String currency, InvoiceStatus status, String description) {
        this.cashAccountId = cashAccountId;
        this.counterpartyId = counterpartyId;
        this.invoiceNumber = invoiceNumber;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.description = description;
    }

    public Long getCashAccountId() {
        return cashAccountId;
    }

    public void setCashAccountId(Long cashAccountId) {
        this.cashAccountId = cashAccountId;
    }

    public Long getCounterpartyId() {
        return counterpartyId;
    }

    public void setCounterpartyId(Long counterpartyId) {
        this.counterpartyId = counterpartyId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
