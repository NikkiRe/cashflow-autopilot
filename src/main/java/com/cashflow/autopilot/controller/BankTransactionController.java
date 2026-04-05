package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.BankTransactionDTO;
import com.cashflow.autopilot.dto.CreateBankTransactionRequest;
import com.cashflow.autopilot.service.BankTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-transactions")
public class BankTransactionController {

    private final BankTransactionService transactionService;

    public BankTransactionController(BankTransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<BankTransactionDTO> createTransaction(@Valid @RequestBody CreateBankTransactionRequest request) {
        BankTransactionDTO transaction = transactionService.createTransaction(request);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankTransactionDTO> getTransaction(@PathVariable Long id) {
        BankTransactionDTO transaction = transactionService.getTransaction(id);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/cash-account/{cashAccountId}")
    public ResponseEntity<List<BankTransactionDTO>> getTransactionsByCashAccount(@PathVariable Long cashAccountId) {
        List<BankTransactionDTO> transactions = transactionService.getTransactionsByCashAccount(cashAccountId);
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
