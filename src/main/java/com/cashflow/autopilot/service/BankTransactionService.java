package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.BankTransaction;
import com.cashflow.autopilot.domain.entity.CashAccount;
import com.cashflow.autopilot.domain.enums.TransactionDirection;
import com.cashflow.autopilot.dto.BankTransactionDTO;
import com.cashflow.autopilot.dto.CreateBankTransactionRequest;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.BankTransactionRepository;
import com.cashflow.autopilot.repository.CashAccountRepository;
import org.springframework.stereotype.Service;
import com.cashflow.autopilot.events.AccountOutbox;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BankTransactionService {

    private final BankTransactionRepository transactionRepository;
    private final AccountOutbox outbox;
    private final CashAccountRepository cashAccountRepository;

    public BankTransactionService(BankTransactionRepository transactionRepository,
                                  CashAccountRepository cashAccountRepository, AccountOutbox outbox) {
        this.transactionRepository = transactionRepository;
        this.outbox = outbox;
        this.cashAccountRepository = cashAccountRepository;
    }

    public BankTransactionDTO createTransaction(CreateBankTransactionRequest request) {
        outbox.lock(request.getCashAccountId());
        CashAccount cashAccount = cashAccountRepository.findById(request.getCashAccountId())
                .orElseThrow(() -> new NotFoundException("Cash account not found with id: " + request.getCashAccountId()));

        if (!cashAccount.getCurrency().equals(request.getCurrency())) {
            throw new IllegalArgumentException("Currency must match cash account");
        }

        BankTransaction transaction = new BankTransaction();
        transaction.setCashAccount(cashAccount);
        transaction.setBookedAt(request.getBookedAt());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setDirection(request.getDirection());
        transaction.setDescription(request.getDescription());
        transaction.setReferenceNumber(request.getReferenceNumber());

        BankTransaction saved = transactionRepository.save(transaction);
        outbox.snapshot(request.getCashAccountId());
        return toDTO(saved);
    }

    public BankTransactionDTO getTransaction(Long id) {
        BankTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found with id: " + id));
        return toDTO(transaction);
    }

    public List<BankTransactionDTO> getTransactionsByCashAccount(Long cashAccountId) {
        return transactionRepository.findByCashAccountId(cashAccountId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteTransaction(Long id) {
        var existing = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found with id: " + id));
        long accountId = existing.getCashAccount().getId();
        outbox.lock(accountId);
        transactionRepository.deleteById(id);
        outbox.snapshot(accountId);
    }

    public BigDecimal calculateBalanceBefore(Long cashAccountId, LocalDate date) {
        BigDecimal totalIn = transactionRepository.sumInByCashAccountAndBookedAtBeforeOrEqual(cashAccountId, date);
        BigDecimal totalOut = transactionRepository.sumOutByCashAccountAndBookedAtBeforeOrEqual(cashAccountId, date);
        return totalIn.subtract(totalOut);
    }

    private BankTransactionDTO toDTO(BankTransaction transaction) {
        return new BankTransactionDTO(
                transaction.getId(),
                transaction.getCashAccount() != null ? transaction.getCashAccount().getId() : null,
                transaction.getBookedAt(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getDirection(),
                transaction.getDescription(),
                transaction.getReferenceNumber(),
                transaction.getCreatedAt()
        );
    }
}
