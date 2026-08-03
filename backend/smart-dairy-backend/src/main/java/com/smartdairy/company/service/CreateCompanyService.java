package com.smartdairy.company.service;

import com.smartdairy.company.dto.CompanyResponse;
import com.smartdairy.company.dto.CreateCompanyRequest;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.mapper.CompanyMapper;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.tenant.context.TenantContextHolder;
import com.smartdairy.tenant.service.TenantDefaultMasterDataService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateCompanyService {

    private final CompanyRepository repository;

    private final CompanyMapper mapper;

    private final TenantDefaultMasterDataService defaultMasterDataService;

    public CompanyResponse create(CreateCompanyRequest request) {

        java.util.UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();

        if (repository.existsByCompanyCodeAndTenantUuid(request.companyCode(), tenantUuid)) {
            throw new BusinessException("Company code already exists.");
        }

        Company company = mapper.toEntity(request);

        Company savedCompany = repository.save(company);

        defaultMasterDataService.createDefaultMasters(savedCompany.getTenantUuid());

        return mapper.toResponse(savedCompany);

    }

}