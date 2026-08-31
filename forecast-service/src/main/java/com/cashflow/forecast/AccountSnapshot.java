package com.cashflow.forecast;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AccountSnapshot(int schemaVersion, UUID eventId, long accountId, long revision,
                              boolean deleted, String currency, List<InvoiceLine> invoices,
                              List<ObligationLine> obligations, List<TransactionLine> transactions) {
    public record InvoiceLine(LocalDate dueDate, BigDecimal amount, String status) {}
    public record ObligationLine(LocalDate nextDueDate, BigDecimal amount, String recurrence, boolean active) {}
    public record TransactionLine(LocalDate bookedAt, BigDecimal amount, String direction) {}
}
