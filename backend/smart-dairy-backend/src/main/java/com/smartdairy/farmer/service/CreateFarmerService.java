package com.smartdairy.farmer.service;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.mapper.FarmerMapper;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.farmerconfiguration.mapper.FarmerConfigurationMapper;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.master.repository.MilkTypeRepository;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreateFarmerService {

    private final FarmerRepository farmerRepository;
    private final BranchRepository branchRepository;
    private final FarmerMapper farmerMapper;
    private final FarmerConfigurationRepository farmerConfigurationRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final CollectionMethodRepository collectionMethodRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final RateCategoryRepository rateCategoryRepository;
    private final FarmerConfigurationMapper farmerConfigurationMapper;

    public FarmerResponse create(CreateFarmerRequest request) {

        log.info("Creating farmer with code: {} and name: {}", request.farmerCode(), request.farmerName());

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() -> {
                    log.error("Branch not found with UUID: {}", request.branchUuid());
                    return new ResourceNotFoundException("Branch not found.");
                });

        if (farmerRepository.existsByBranchIdAndFarmerCode(
                branch.getId(),
                request.farmerCode())) {

            log.warn("Farmer code already exists for branch: {}", branch.getId());
            throw new BusinessException("Farmer code already exists.");
        }

        Farmer farmer = farmerMapper.toEntity(request);

        farmer.setBranch(branch);

        Farmer saved = farmerRepository.saveAndFlush(farmer);

        log.debug("Farmer saved successfully with UUID: {}", saved.getUuid());

        // Auto-create farmer configuration (always, since fields are required)
        log.info("Auto-creating farmer configuration for farmer UUID: {}", saved.getUuid());
        try {
            createFarmerConfiguration(saved, request);
            log.info("Farmer configuration created successfully for farmer UUID: {}", saved.getUuid());
        } catch (Exception e) {
            log.error("Failed to create farmer configuration for farmer UUID: {}", saved.getUuid(), e);
            throw e;
        }

        return farmerMapper.toResponse(saved);
    }

    private void createFarmerConfiguration(Farmer farmer, CreateFarmerRequest request) {
        
        log.debug("Looking up master data for farmer configuration");
        
        MilkType milkType = milkTypeRepository.findByUuid(request.milkTypeUuid())
                .orElseThrow(() -> {
                    log.error("Milk Type not found with UUID: {}", request.milkTypeUuid());
                    return new ResourceNotFoundException("Milk Type not found.");
                });

        CollectionMethod collectionMethod = collectionMethodRepository.findByUuid(request.collectionMethodUuid())
                .orElseThrow(() -> {
                    log.error("Collection Method not found with UUID: {}", request.collectionMethodUuid());
                    return new ResourceNotFoundException("Collection Method not found.");
                });

        PaymentCycle paymentCycle = paymentCycleRepository.findByUuid(request.paymentCycleUuid())
                .orElseThrow(() -> {
                    log.error("Payment Cycle not found with UUID: {}", request.paymentCycleUuid());
                    return new ResourceNotFoundException("Payment Cycle not found.");
                });

        RateCategory rateCategory = rateCategoryRepository.findByUuid(request.rateCategoryUuid())
                .orElseThrow(() -> {
                    log.error("Rate Category not found with UUID: {}", request.rateCategoryUuid());
                    return new ResourceNotFoundException("Rate Category not found.");
                });

        log.debug("All master data found. Creating farmer configuration entity");

        // Check for existing active configuration
        farmerConfigurationRepository.findByFarmerIdAndActiveTrue(farmer.getId())
                .ifPresent(existing -> {
                    log.debug("Existing farmer configuration found. Deactivating it.");
                    
                    if (!request.configEffectiveFrom().isAfter(existing.getEffectiveFrom())) {
                        log.error("Effective From date is not after existing configuration date");
                        throw new BusinessException(
                                "Effective From must be greater than existing configuration date.");
                    }

                    existing.setEffectiveTo(request.configEffectiveFrom().minusDays(1));
                    existing.setActive(false);
                    farmerConfigurationRepository.saveAndFlush(existing);
                    log.debug("Existing configuration deactivated.");
                });

        // Create new farmer configuration
        FarmerConfiguration configuration = new FarmerConfiguration();
        configuration.setFarmer(farmer);
        configuration.setMilkType(milkType);
        configuration.setCollectionMethod(collectionMethod);
        configuration.setPaymentCycle(paymentCycle);
        configuration.setRateCategory(rateCategory);
        configuration.setEffectiveFrom(request.configEffectiveFrom());
        configuration.setActive(true);

        FarmerConfiguration saved = farmerConfigurationRepository.saveAndFlush(configuration);
        log.debug("Farmer configuration saved with UUID: {}", saved.getUuid());
    }
}