package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.CashAccountDTO;
import com.cashflow.autopilot.dto.CreateCashAccountRequest;
import com.cashflow.autopilot.service.CashAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cash-accounts")
public class CashAccountController {

    private final CashAccountService cashAccountService;

    public CashAccountController(CashAccountService cashAccountService) {
        this.cashAccountService = cashAccountService;
    }

    @PostMapping
    public ResponseEntity<CashAccountDTO> createCashAccount(@Valid @RequestBody CreateCashAccountRequest request) {
        CashAccountDTO account = cashAccountService.createCashAccount(request);
        return new ResponseEntity<>(account, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashAccountDTO> getCashAccount(@PathVariable Long id) {
        CashAccountDTO account = cashAccountService.getCashAccount(id);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<CashAccountDTO>> getCashAccountsByCompany(@PathVariable Long companyId) {
        List<CashAccountDTO> accounts = cashAccountService.getCashAccountsByCompany(companyId);
        return ResponseEntity.ok(accounts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCashAccount(@PathVariable Long id) {
        cashAccountService.deleteCashAccount(id);
        return ResponseEntity.noContent().build();
    }
}
