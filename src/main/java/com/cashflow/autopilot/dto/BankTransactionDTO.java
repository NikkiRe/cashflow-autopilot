package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.TransactionDirection;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BankTransactionDTO {
    private Long id;
    private Long cashAccountId;
    private LocalDate bookedAt;
    private BigDecimal amount;
    private String currency;
    private TransactionDirection direction;
    private String description;
    private String referenceNumber;
    private LocalDateTime createdAt;

    public BankTransactionDTO() {}

    public BankTransactionDTO(Long id, Long cashAccountId, LocalDate bookedAt, BigDecimal amount,
                              String currency, TransactionDirection direction, String description,
                              String referenceNumber, LocalDateTime createdAt) {
        this.id = id;
        this.cashAccountId = cashAccountId;
        this.bookedAt = bookedAt;
        this.amount = amount;
        this.currency = currency;
        this.direction = direction;
        this.description = description;
        this.referenceNumber = referenceNumber;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
