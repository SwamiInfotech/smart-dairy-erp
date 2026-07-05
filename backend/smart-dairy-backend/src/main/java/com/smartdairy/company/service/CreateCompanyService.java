package com.smartdairy.company.service;

import com.smartdairy.company.dto.CompanyResponse;
import com.smartdairy.company.dto.CreateCompanyRequest;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.mapper.CompanyMapper;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.exception.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateCompanyService {

    private final CompanyRepository repository;

    private final CompanyMapper mapper;

    public CompanyResponse create(CreateCompanyRequest request) {

        if (repository.existsByCompanyCode(request.companyCode())) {
            throw new BusinessException("Company code already exists.");
        }

        Company company = mapper.toEntity(request);

        Company savedCompany = repository.save(company);

        return mapper.toResponse(savedCompany);

    }

}