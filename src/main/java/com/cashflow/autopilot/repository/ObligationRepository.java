package com.cashflow.autopilot.repository;

import com.cashflow.autopilot.domain.entity.Obligation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObligationRepository extends JpaRepository<Obligation, Long> {
    List<Obligation> findByCashAccountId(Long cashAccountId);
    List<Obligation> findByCashAccountIdAndActiveTrue(Long cashAccountId);
}
