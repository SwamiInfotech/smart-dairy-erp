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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UpdateFarmerService {

    private final FarmerRepository farmerRepository;
    private final BranchRepository branchRepository;
    private final FarmerMapper farmerMapper;
    private final FarmerConfigurationUpsertService farmerConfigurationUpsertService;
    private final FarmerResponseFactory farmerResponseFactory;

    public FarmerResponse update(UUID uuid, CreateFarmerRequest request) {
        log.info("Updating farmer with uuid={}.", uuid);

        Farmer farmer = farmerRepository.findByUuidAndActiveTrue(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found."));

        if (farmerRepository.existsByBranchIdAndFarmerCodeAndUuidNot(branch.getId(), request.farmerCode(), uuid)) {
            throw new BusinessException("Farmer code already exists.");
        }

        farmerMapper.updateEntity(request, farmer);
        farmer.setBranch(branch);

        Farmer saved = farmerRepository.saveAndFlush(farmer);
        farmerConfigurationUpsertService.upsert(saved, request);

        return farmerResponseFactory.toResponse(saved);
    }
}
