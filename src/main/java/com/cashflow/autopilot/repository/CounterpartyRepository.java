package com.cashflow.autopilot.repository;

import com.cashflow.autopilot.domain.entity.Counterparty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CounterpartyRepository extends JpaRepository<Counterparty, Long> {
    List<Counterparty> findByCompanyId(Long companyId);
    Optional<Counterparty> findByName(String name);
}
