package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.RecurrenceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ObligationDTO {
    private Long id;
    private Long cashAccountId;
    private String name;
    private BigDecimal amount;
    private String currency;
    private LocalDate nextDueDate;
    private RecurrenceType recurrence;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;

    public ObligationDTO() {}

    public ObligationDTO(Long id, Long cashAccountId, String name, BigDecimal amount,
                          String currency, LocalDate nextDueDate, RecurrenceType recurrence,
                          String description, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.cashAccountId = cashAccountId;
        this.name = name;
        this.amount = amount;
        this.currency = currency;
        this.nextDueDate = nextDueDate;
        this.recurrence = recurrence;
        this.description = description;
        this.active = active;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public RecurrenceType getRecurrence() {
        return recurrence;
    }

    public void setRecurrence(RecurrenceType recurrence) {
        this.recurrence = recurrence;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
