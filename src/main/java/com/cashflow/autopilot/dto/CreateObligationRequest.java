package com.cashflow.autopilot.dto;

import com.cashflow.autopilot.domain.enums.RecurrenceType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateObligationRequest {
    @NotNull(message = "Cash account ID is required")
    private Long cashAccountId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Currency is required")
    private String currency;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    @NotNull(message = "Recurrence type is required")
    private RecurrenceType recurrence;

    private String description;

    public CreateObligationRequest() {}

    public CreateObligationRequest(Long cashAccountId, String name, BigDecimal amount,
                                    String currency, LocalDate nextDueDate,
                                    RecurrenceType recurrence, String description) {
        this.cashAccountId = cashAccountId;
        this.name = name;
        this.amount = amount;
        this.currency = currency;
        this.nextDueDate = nextDueDate;
        this.recurrence = recurrence;
        this.description = description;
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
}
