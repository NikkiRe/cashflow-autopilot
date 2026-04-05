package com.cashflow.autopilot.service;

import com.cashflow.autopilot.domain.entity.Company;
import com.cashflow.autopilot.dto.CompanyDTO;
import com.cashflow.autopilot.dto.CreateCompanyRequest;
import com.cashflow.autopilot.exception.NotFoundException;
import com.cashflow.autopilot.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyDTO createCompany(CreateCompanyRequest request) {
        Company company = new Company();
        company.setName(request.getName());
        company.setTaxId(request.getTaxId());
        Company saved = companyRepository.save(company);
        return toDTO(saved);
    }

    public CompanyDTO getCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found with id: " + id));
        return toDTO(company);
    }

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new NotFoundException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    private CompanyDTO toDTO(Company company) {
        return new CompanyDTO(
                company.getId(),
                company.getName(),
                company.getTaxId(),
                company.getCreatedAt()
        );
    }
}
