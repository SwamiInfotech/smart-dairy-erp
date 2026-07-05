package com.smartdairy.branch.create;

import com.smartdairy.branch.dto.BranchResponse;
import com.smartdairy.branch.dto.CreateBranchRequest;
import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.mapper.BranchMapper;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateBranchService {

    private final BranchRepository branchRepository;
    private final CompanyRepository companyRepository;
    private final BranchMapper branchMapper;

    public BranchResponse create(CreateBranchRequest request) {

        Company company = companyRepository
                .findByUuid(request.companyUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Company not found."));

        if (branchRepository.existsByBranchCode(request.branchCode())) {
            throw new BusinessException("Branch code already exists.");
        }

        Branch branch = branchMapper.toEntity(request);

        branch.setCompany(company);

        Branch saved = branchRepository.save(branch);

        return branchMapper.toResponse(saved);
    }
}