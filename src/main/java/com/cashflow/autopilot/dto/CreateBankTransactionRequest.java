package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.TransactionDirection;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateBankTransactionRequest {
    @NotNull(message = "Cash account ID is required")
    private Long cashAccountId;

    @NotNull(message = "Booked date is required")
    private LocalDate bookedAt;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Currency is required")
    private String currency;

    @NotNull(message = "Direction is required")
    private TransactionDirection direction;

    private String description;

    private String referenceNumber;

    public CreateBankTransactionRequest() {}

    public CreateBankTransactionRequest(Long cashAccountId, LocalDate bookedAt, BigDecimal amount,
                                         String currency, TransactionDirection direction,
                                         String description, String referenceNumber) {
        this.cashAccountId = cashAccountId;
        this.bookedAt = bookedAt;
        this.amount = amount;
        this.currency = currency;
        this.direction = direction;
        this.description = description;
        this.referenceNumber = referenceNumber;
    }

    public Long getCashAccountId() {
        return cashAccountId;
    }

    public void setCashAccountId(Long cashAccountId) {
        this.cashAccountId = cashAccountId;
    }

    public LocalDate getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(LocalDate bookedAt) {
        this.bookedAt = bookedAt;
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

    public TransactionDirection getDirection() {
        return direction;
    }

    public void setDirection(TransactionDirection direction) {
        this.direction = direction;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
}
