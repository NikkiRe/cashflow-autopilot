package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.CompanyDTO;
import com.cashflow.autopilot.dto.CreateCompanyRequest;
import com.cashflow.autopilot.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CreateCompanyRequest request) {
        CompanyDTO company = companyService.createCompany(request);
        return new ResponseEntity<>(company, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompany(@PathVariable Long id) {
        CompanyDTO company = companyService.getCompany(id);
        return ResponseEntity.ok(company);
    }

    @GetMapping
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
