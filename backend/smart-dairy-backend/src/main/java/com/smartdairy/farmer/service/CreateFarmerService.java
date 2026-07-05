package com.smartdairy.farmer.service;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.mapper.FarmerMapper;
import com.smartdairy.farmer.repository.FarmerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateFarmerService {

    private final FarmerRepository farmerRepository;
    private final BranchRepository branchRepository;
    private final FarmerMapper farmerMapper;

    public FarmerResponse create(CreateFarmerRequest request) {

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Branch not found."));

        if (farmerRepository.existsByBranchIdAndFarmerCode(
                branch.getId(),
                request.farmerCode())) {

            throw new BusinessException("Farmer code already exists.");
        }

        Farmer farmer = farmerMapper.toEntity(request);

        farmer.setBranch(branch);

        Farmer saved = farmerRepository.save(farmer);

        return farmerMapper.toResponse(saved);
    }
}