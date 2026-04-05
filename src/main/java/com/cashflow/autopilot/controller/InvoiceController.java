package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.InvoiceDTO;
import com.cashflow.autopilot.dto.CreateInvoiceRequest;
import com.cashflow.autopilot.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceDTO invoice = invoiceService.createInvoice(request);
        return new ResponseEntity<>(invoice, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Long id) {
        InvoiceDTO invoice = invoiceService.getInvoice(id);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/cash-account/{cashAccountId}")
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByCashAccount(@PathVariable Long cashAccountId) {
        List<InvoiceDTO> invoices = invoiceService.getInvoicesByCashAccount(cashAccountId);
        return ResponseEntity.ok(invoices);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
