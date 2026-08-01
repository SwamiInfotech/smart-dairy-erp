package com.smartdairy.farmerconfiguration.service;

import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.farmerconfiguration.dto.CreateFarmerConfigurationRequest;
import com.smartdairy.farmerconfiguration.dto.FarmerConfigurationResponse;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.farmerconfiguration.mapper.FarmerConfigurationMapper;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.master.repository.MilkTypeRepository;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CreateFarmerConfigurationService {

    private final FarmerConfigurationRepository repository;
    private final FarmerRepository farmerRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final MilkRateChartRepository milkRateChartRepository;
    private final CollectionMethodRepository collectionMethodRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final RateCategoryRepository rateCategoryRepository;
    private final FarmerConfigurationMapper mapper;

    public FarmerConfigurationResponse create(CreateFarmerConfigurationRequest request) {

        log.info("Creating farmer configuration for farmer UUID: {}", request.farmerUuid());

        Farmer farmer = farmerRepository.findByUuid(request.farmerUuid())
                .orElseThrow(() -> {
                    log.error("Farmer not found with UUID: {}", request.farmerUuid());
                    return new ResourceNotFoundException("Farmer not found.");
                });

        log.debug("Found farmer: {} with ID: {}", farmer.getFarmerCode(), farmer.getId());

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
                .orElseGet(() -> {
                    log.warn("Payment Cycle not found with UUID: {}, falling back to WEEKLY.", request.paymentCycleUuid());
                    return paymentCycleRepository.findByCode("WEEKLY")
                            .orElseThrow(() -> {
                                log.error("Default payment cycle WEEKLY not found.");
                                return new ResourceNotFoundException("Payment Cycle not found.");
                            });
                });

        RateCategory rateCategory = rateCategoryRepository.findByUuid(request.rateCategoryUuid())
                .orElseThrow(() -> {
                    log.error("Rate Category not found with UUID: {}", request.rateCategoryUuid());
                    return new ResourceNotFoundException("Rate Category not found.");
                });

        MilkRateChart milkRateChart = milkRateChartRepository.findByUuid(request.milkRateChartUuid())
                .orElseThrow(() -> {
                    log.error("Milk Rate Chart not found with UUID: {}", request.milkRateChartUuid());
                    return new ResourceNotFoundException("Milk Rate Chart not found.");
                });

        validateMilkRateChart(milkRateChart, farmer, rateCategory, collectionMethod, request.effectiveFrom());

        log.debug("All master data entities found. Creating farmer configuration.");

        repository.findByFarmerIdAndActiveTrue(farmer.getId())
                .ifPresent(existing -> {

                    log.debug("Existing farmer configuration found. Deactivating it.");

                    if (!request.effectiveFrom().isAfter(existing.getEffectiveFrom())) {
                        log.error("Effective From date is not after existing configuration date");
                        throw new BusinessException(
                                "Effective From must be greater than existing configuration date.");
                    }

                    existing.setEffectiveTo(request.effectiveFrom().minusDays(1));
                    existing.setActive(false);

                    repository.save(existing);
                    log.debug("Existing configuration deactivated.");
                });

        FarmerConfiguration configuration = mapper.toEntity(request);

        configuration.setFarmer(farmer);
        configuration.setMilkType(milkType);
        configuration.setCollectionMethod(collectionMethod);
        configuration.setPaymentCycle(paymentCycle);
        configuration.setRateCategory(rateCategory);
        configuration.setMilkRateChart(milkRateChart);

        farmer.setMilkRateChart(milkRateChart);
        farmerRepository.save(farmer);

        FarmerConfiguration saved = repository.save(configuration);

        log.info("Farmer configuration saved successfully with UUID: {}", saved.getUuid());

        return mapper.toResponse(saved);
    }

    private void validateMilkRateChart(
            MilkRateChart milkRateChart,
            Farmer farmer,
            RateCategory rateCategory,
            CollectionMethod collectionMethod,
            java.time.LocalDate effectiveFrom
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
}