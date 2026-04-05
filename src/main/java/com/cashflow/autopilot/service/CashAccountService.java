package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.CashAccount;
import com.cashflow.autopilot.domain.entity.Company;
import com.cashflow.autopilot.dto.CashAccountDTO;
import com.cashflow.autopilot.dto.CreateCashAccountRequest;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.CashAccountRepository;
import com.cashflow.autopilot.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CashAccountService {

    private final CashAccountRepository cashAccountRepository;
    private final CompanyRepository companyRepository;

    public CashAccountService(CashAccountRepository cashAccountRepository,
                              CompanyRepository companyRepository) {
        this.cashAccountRepository = cashAccountRepository;
        this.companyRepository = companyRepository;
    }

    public CashAccountDTO createCashAccount(CreateCashAccountRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found with id: " + request.getCompanyId()));

        CashAccount account = new CashAccount();
        account.setCompany(company);
        account.setName(request.getName());
        account.setAccountNumber(request.getAccountNumber());
        account.setCurrency(request.getCurrency());
        CashAccount saved = cashAccountRepository.save(account);
        return toDTO(saved);
    }

    public CashAccountDTO getCashAccount(Long id) {
        CashAccount account = cashAccountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cash account not found with id: " + id));
        return toDTO(account);
    }

    public List<CashAccountDTO> getCashAccountsByCompany(Long companyId) {
        return cashAccountRepository.findByCompanyId(companyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteCashAccount(Long id) {
        if (!cashAccountRepository.existsById(id)) {
            throw new NotFoundException("Cash account not found with id: " + id);
        }
        cashAccountRepository.deleteById(id);
    }

    public CashAccount getCashAccountEntity(Long id) {
        return cashAccountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cash account not found with id: " + id));
    }

    private CashAccountDTO toDTO(CashAccount account) {
        return new CashAccountDTO(
                account.getId(),
                account.getCompany() != null ? account.getCompany().getId() : null,
                account.getName(),
                account.getAccountNumber(),
                account.getCurrency(),
                account.getActive(),
                account.getCreatedAt()
        );
    }
}
