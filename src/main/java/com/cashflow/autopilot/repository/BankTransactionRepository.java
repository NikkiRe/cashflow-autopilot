package com.cashflow.autopilot.repository;

import com.cashflow.autopilot.domain.entity.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByCashAccountId(Long cashAccountId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM BankTransaction t " +
           "WHERE t.cashAccount.id = :cashAccountId " +
           "AND t.direction = 'IN' " +
           "AND t.bookedAt <= :date")
    BigDecimal sumInByCashAccountAndBookedAtBeforeOrEqual(@Param("cashAccountId") Long cashAccountId,
                                                         @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM BankTransaction t " +
           "WHERE t.cashAccount.id = :cashAccountId " +
           "AND t.direction = 'OUT' " +
           "AND t.bookedAt <= :date")
    BigDecimal sumOutByCashAccountAndBookedAtBeforeOrEqual(@Param("cashAccountId") Long cashAccountId,
                                                          @Param("date") LocalDate date);
}
