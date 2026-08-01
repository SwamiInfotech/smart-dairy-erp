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
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.master.repository.MilkTypeRepository;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

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
    private final MilkRateChartRepository milkRateChartRepository;

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

        UUID milkTypeUuid = resolveMilkTypeUuid(request);
        UUID collectionMethodUuid = resolveCollectionMethodUuid(request);
        UUID paymentCycleUuid = resolvePaymentCycleUuid(request);
        UUID rateCategoryUuid = resolveRateCategoryUuid(request);
        UUID milkRateChartUuid = resolveMilkRateChartUuid(request);
        LocalDate effectiveFrom = resolveConfigEffectiveFrom(request);

        if (milkTypeUuid == null || collectionMethodUuid == null || paymentCycleUuid == null
                || rateCategoryUuid == null || milkRateChartUuid == null || effectiveFrom == null) {
            log.error("Farmer configuration details are incomplete for farmer uuid={}", farmer.getUuid());
            throw new BusinessException("Farmer configuration details are required.");
        }

        MilkType milkType = milkTypeRepository.findByUuid(milkTypeUuid)
                .orElseThrow(() -> {
                    log.error("Milk Type not found with UUID: {}", milkTypeUuid);
                    return new ResourceNotFoundException("Milk Type not found.");
                });

        CollectionMethod collectionMethod = collectionMethodRepository.findByUuid(collectionMethodUuid)
                .orElseThrow(() -> {
                    log.error("Collection Method not found with UUID: {}", collectionMethodUuid);
                    return new ResourceNotFoundException("Collection Method not found.");
                });

        PaymentCycle paymentCycle = paymentCycleRepository.findByUuid(paymentCycleUuid)
                .orElseGet(() -> {
                    log.warn("Payment Cycle not found with UUID: {}, falling back to WEEKLY.", paymentCycleUuid);
                    return paymentCycleRepository.findByCode("WEEKLY")
                            .orElseThrow(() -> {
                                log.error("Default payment cycle WEEKLY not found.");
                                return new ResourceNotFoundException("Payment Cycle not found.");
                            });
                });

        RateCategory rateCategory = rateCategoryRepository.findByUuid(rateCategoryUuid)
                .orElseThrow(() -> {
                    log.error("Rate Category not found with UUID: {}", rateCategoryUuid);
                    return new ResourceNotFoundException("Rate Category not found.");
                });

        MilkRateChart milkRateChart = milkRateChartRepository.findByUuid(milkRateChartUuid)
                .orElseThrow(() -> {
                    log.error("Milk Rate Chart not found with UUID: {}", milkRateChartUuid);
                    return new ResourceNotFoundException("Milk Rate Chart not found.");
                });

        validateMilkRateChart(milkRateChart, farmer, rateCategory, collectionMethod, effectiveFrom);

        log.debug("All master data found. Creating farmer configuration entity");

        // Check for existing active configuration
        farmerConfigurationRepository.findByFarmerIdAndActiveTrue(farmer.getId())
                .ifPresent(existing -> {
                    log.debug("Existing farmer configuration found. Deactivating it.");
                    
                    if (!effectiveFrom.isAfter(existing.getEffectiveFrom())) {
                        log.error("Effective From date is not after existing configuration date");
                        throw new BusinessException(
                                "Effective From must be greater than existing configuration date.");
                    }

                    existing.setEffectiveTo(effectiveFrom.minusDays(1));
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
        configuration.setMilkRateChart(milkRateChart);
        configuration.setEffectiveFrom(effectiveFrom);
        configuration.setActive(true);

        farmer.setMilkRateChart(milkRateChart);
        farmerRepository.save(farmer);

        FarmerConfiguration saved = farmerConfigurationRepository.saveAndFlush(configuration);
        log.debug("Farmer configuration saved with UUID: {}", saved.getUuid());
    }

    private void validateMilkRateChart(
            MilkRateChart milkRateChart,
            Farmer farmer,
            RateCategory rateCategory,
            CollectionMethod collectionMethod,
            LocalDate effectiveFrom
    ) {
        if (!milkRateChart.getBranch().getId().equals(farmer.getBranch().getId())) {
            log.error("Milk Rate Chart uuid={} does not belong to farmer branch id={}",
                    milkRateChart.getUuid(), farmer.getBranch().getId());
            throw new BusinessException("Milk Rate Chart does not belong to farmer branch.");
        }

        if (!milkRateChart.getRateCategory().getId().equals(rateCategory.getId())) {
            log.error("Milk Rate Chart uuid={} does not match rate category id={}",
                    milkRateChart.getUuid(), rateCategory.getId());
            throw new BusinessException("Milk Rate Chart does not match rate category.");
        }

        if (!milkRateChart.getCollectionMethod().getId().equals(collectionMethod.getId())) {
            log.error("Milk Rate Chart uuid={} does not match collection method id={}",
                    milkRateChart.getUuid(), collectionMethod.getId());
            throw new BusinessException("Milk Rate Chart does not match collection method.");
        }

        if (effectiveFrom.isBefore(milkRateChart.getEffectiveFrom())
                || (milkRateChart.getEffectiveTo() != null && effectiveFrom.isAfter(milkRateChart.getEffectiveTo()))) {
            log.error("Milk Rate Chart uuid={} is not applicable for effective date={}",
                    milkRateChart.getUuid(), effectiveFrom);
            throw new BusinessException("Milk Rate Chart is not applicable for effective date.");
        }
    }

    private UUID resolveMilkTypeUuid(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().milkTypeUuid() != null) {
            return request.farmerConfiguration().milkTypeUuid();
        }
        return request.milkTypeUuid();
    }

    private UUID resolveCollectionMethodUuid(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().collectionMethodUuid() != null) {
            return request.farmerConfiguration().collectionMethodUuid();
        }
        return request.collectionMethodUuid();
    }

    private UUID resolvePaymentCycleUuid(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().paymentCycleUuid() != null) {
            return request.farmerConfiguration().paymentCycleUuid();
        }
        return request.paymentCycleUuid();
    }

    private UUID resolveRateCategoryUuid(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().rateCategoryUuid() != null) {
            return request.farmerConfiguration().rateCategoryUuid();
        }
        return request.rateCategoryUuid();
    }

    private UUID resolveMilkRateChartUuid(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().milkRateChartUuid() != null) {
            return request.farmerConfiguration().milkRateChartUuid();
        }
        return request.milkRateChartUuid();
    }

    private LocalDate resolveConfigEffectiveFrom(CreateFarmerRequest request) {
        if (request.farmerConfiguration() != null && request.farmerConfiguration().configEffectiveFrom() != null) {
            return request.farmerConfiguration().configEffectiveFrom();
        }
        return request.configEffectiveFrom();
    }
}