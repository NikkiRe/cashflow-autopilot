package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.CashAccount;
import com.cashflow.autopilot.domain.entity.Obligation;
import com.cashflow.autopilot.domain.enums.RecurrenceType;
import com.cashflow.autopilot.dto.ObligationDTO;
import com.cashflow.autopilot.dto.CreateObligationRequest;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.CashAccountRepository;
import com.cashflow.autopilot.repository.ObligationRepository;
import org.springframework.stereotype.Service;
import com.cashflow.autopilot.events.AccountOutbox;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ObligationService {

    private final ObligationRepository obligationRepository;
    private final AccountOutbox outbox;
    private final CashAccountRepository cashAccountRepository;

    public ObligationService(ObligationRepository obligationRepository,
                             CashAccountRepository cashAccountRepository, AccountOutbox outbox) {
        this.obligationRepository = obligationRepository;
        this.outbox = outbox;
        this.cashAccountRepository = cashAccountRepository;
    }

    public ObligationDTO createObligation(CreateObligationRequest request) {
        outbox.lock(request.getCashAccountId());
        CashAccount cashAccount = cashAccountRepository.findById(request.getCashAccountId())
                .orElseThrow(() -> new NotFoundException("Cash account not found with id: " + request.getCashAccountId()));

        if (!cashAccount.getCurrency().equals(request.getCurrency())) {
            throw new IllegalArgumentException("Currency must match cash account");
        }

        Obligation obligation = new Obligation();
        obligation.setCashAccount(cashAccount);
        obligation.setName(request.getName());
        obligation.setAmount(request.getAmount());
        obligation.setCurrency(request.getCurrency());
        obligation.setNextDueDate(request.getNextDueDate());
        obligation.setRecurrence(request.getRecurrence());
        obligation.setDescription(request.getDescription());

        Obligation saved = obligationRepository.save(obligation);
        outbox.snapshot(request.getCashAccountId());
        return toDTO(saved);
    }

    public ObligationDTO getObligation(Long id) {
        Obligation obligation = obligationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obligation not found with id: " + id));
        return toDTO(obligation);
    }

    public List<ObligationDTO> getObligationsByCashAccount(Long cashAccountId) {
        return obligationRepository.findByCashAccountId(cashAccountId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteObligation(Long id) {
        var existing = obligationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obligation not found with id: " + id));
        long accountId = existing.getCashAccount().getId();
        outbox.lock(accountId);
        obligationRepository.deleteById(id);
        outbox.snapshot(accountId);
    }

    public List<Obligation> findActiveByCashAccount(Long cashAccountId) {
        return obligationRepository.findByCashAccountIdAndActiveTrue(cashAccountId);
    }

    private ObligationDTO toDTO(Obligation obligation) {
        return new ObligationDTO(
                obligation.getId(),
                obligation.getCashAccount() != null ? obligation.getCashAccount().getId() : null,
                obligation.getName(),
                obligation.getAmount(),
                obligation.getCurrency(),
                obligation.getNextDueDate(),
                obligation.getRecurrence(),
                obligation.getDescription(),
                obligation.getActive(),
                obligation.getCreatedAt()
        );
    }
}
