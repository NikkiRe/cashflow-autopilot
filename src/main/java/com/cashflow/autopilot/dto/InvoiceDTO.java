package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvoiceDTO {
    private Long id;
    private Long cashAccountId;
    private Long counterpartyId;
    private String invoiceNumber;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String currency;
    private InvoiceStatus status;
    private String description;
    private LocalDateTime createdAt;

    public InvoiceDTO() {}

    public InvoiceDTO(Long id, Long cashAccountId, Long counterpartyId, String invoiceNumber,
                      LocalDate issueDate, LocalDate dueDate, BigDecimal amount, String currency,
                      InvoiceStatus status, String description, LocalDateTime createdAt) {
        this.id = id;
        this.cashAccountId = cashAccountId;
        this.counterpartyId = counterpartyId;
        this.invoiceNumber = invoiceNumber;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
