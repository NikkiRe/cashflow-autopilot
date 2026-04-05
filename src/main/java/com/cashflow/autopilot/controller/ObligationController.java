package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.ObligationDTO;
import com.cashflow.autopilot.dto.CreateObligationRequest;
import com.cashflow.autopilot.service.ObligationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/obligations")
public class ObligationController {

    private final ObligationService obligationService;

    public ObligationController(ObligationService obligationService) {
        this.obligationService = obligationService;
    }

    @PostMapping
    public ResponseEntity<ObligationDTO> createObligation(@Valid @RequestBody CreateObligationRequest request) {
        ObligationDTO obligation = obligationService.createObligation(request);
        return new ResponseEntity<>(obligation, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ObligationDTO> getObligation(@PathVariable Long id) {
        ObligationDTO obligation = obligationService.getObligation(id);
        return ResponseEntity.ok(obligation);
    }

    @GetMapping("/cash-account/{cashAccountId}")
    public ResponseEntity<List<ObligationDTO>> getObligationsByCashAccount(@PathVariable Long cashAccountId) {
        List<ObligationDTO> obligations = obligationService.getObligationsByCashAccount(cashAccountId);
        return ResponseEntity.ok(obligations);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObligation(@PathVariable Long id) {
        obligationService.deleteObligation(id);
        return ResponseEntity.noContent().build();
    }
}
