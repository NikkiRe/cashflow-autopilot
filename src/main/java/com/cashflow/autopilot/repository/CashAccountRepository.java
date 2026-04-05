package com.cashflow.autopilot.repository;

import com.cashflow.autopilot.domain.entity.CashAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CashAccountRepository extends JpaRepository<CashAccount, Long> {
    List<CashAccount> findByCompanyId(Long companyId);
}
