package com.cashflow.autopilot.repository;

import com.cashflow.autopilot.domain.entity.Invoice;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCashAccountId(Long cashAccountId);

    List<Invoice> findByCashAccountIdAndStatus(Long cashAccountId, InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.cashAccount.id = :cashAccountId " +
           "AND i.status = 'ISSUED' AND i.dueDate = :date")
    List<Invoice> findIssuedByCashAccountIdAndDueDate(@Param("cashAccountId") Long cashAccountId,
                                                      @Param("date") LocalDate date);
}
