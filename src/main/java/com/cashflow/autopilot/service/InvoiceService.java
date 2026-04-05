package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.CashAccount;
import com.cashflow.autopilot.domain.entity.Counterparty;
import com.cashflow.autopilot.domain.entity.Invoice;
import com.cashflow.autopilot.domain.enums.InvoiceStatus;
import com.cashflow.autopilot.dto.InvoiceDTO;
import com.cashflow.autopilot.dto.CreateInvoiceRequest;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.CashAccountRepository;
import com.cashflow.autopilot.repository.CounterpartyRepository;
import com.cashflow.autopilot.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CashAccountRepository cashAccountRepository;
    private final CounterpartyRepository counterpartyRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          CashAccountRepository cashAccountRepository,
                          CounterpartyRepository counterpartyRepository) {
        this.invoiceRepository = invoiceRepository;
        this.cashAccountRepository = cashAccountRepository;
        this.counterpartyRepository = counterpartyRepository;
    }

    public InvoiceDTO createInvoice(CreateInvoiceRequest request) {
        CashAccount cashAccount = cashAccountRepository.findById(request.getCashAccountId())
                .orElseThrow(() -> new NotFoundException("Cash account not found with id: " + request.getCashAccountId()));

        Counterparty counterparty = null;
        if (request.getCounterpartyId() != null) {
            counterparty = counterpartyRepository.findById(request.getCounterpartyId())
                    .orElse(null);
        }

        Invoice invoice = new Invoice();
        invoice.setCashAccount(cashAccount);
        invoice.setCounterparty(counterparty);
        invoice.setInvoiceNumber(request.getInvoiceNumber());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setAmount(request.getAmount());
        invoice.setCurrency(request.getCurrency());
        invoice.setStatus(request.getStatus());
        invoice.setDescription(request.getDescription());

        Invoice saved = invoiceRepository.save(invoice);
        return toDTO(saved);
    }

    public InvoiceDTO getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Invoice not found with id: " + id));
        return toDTO(invoice);
    }

    public List<InvoiceDTO> getInvoicesByCashAccount(Long cashAccountId) {
        return invoiceRepository.findByCashAccountId(cashAccountId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new NotFoundException("Invoice not found with id: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    public List<Invoice> findIssuedByCashAccountAndDueDate(Long cashAccountId, java.time.LocalDate date) {
        return invoiceRepository.findIssuedByCashAccountIdAndDueDate(cashAccountId, date);
    }

    private InvoiceDTO toDTO(Invoice invoice) {
        return new InvoiceDTO(
                invoice.getId(),
                invoice.getCashAccount() != null ? invoice.getCashAccount().getId() : null,
                invoice.getCounterparty() != null ? invoice.getCounterparty().getId() : null,
                invoice.getInvoiceNumber(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getAmount(),
                invoice.getCurrency(),
                invoice.getStatus(),
                invoice.getDescription(),
                invoice.getCreatedAt()
        );
    }
}
