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
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateFarmerConfigurationService {

    private final FarmerConfigurationRepository repository;
    private final FarmerRepository farmerRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final CollectionMethodRepository collectionMethodRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final RateCategoryRepository rateCategoryRepository;
    private final FarmerConfigurationMapper mapper;

    public FarmerConfigurationResponse create(CreateFarmerConfigurationRequest request) {

        Farmer farmer = farmerRepository.findByUuid(request.farmerUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        MilkType milkType = milkTypeRepository.findByUuid(request.milkTypeUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Milk Type not found."));

        CollectionMethod collectionMethod = collectionMethodRepository.findByUuid(request.collectionMethodUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Collection Method not found."));

        PaymentCycle paymentCycle = paymentCycleRepository.findByUuid(request.paymentCycleUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Payment Cycle not found."));

        RateCategory rateCategory = rateCategoryRepository.findByUuid(request.rateCategoryUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Rate Category not found."));

        repository.findByFarmerIdAndActiveTrue(farmer.getId())
                .ifPresent(existing -> {

                    if (!request.effectiveFrom().isAfter(existing.getEffectiveFrom())) {
                        throw new BusinessException(
                                "Effective From must be greater than existing configuration date.");
                    }

                    existing.setEffectiveTo(request.effectiveFrom().minusDays(1));
                    existing.setActive(false);

                    repository.save(existing);
                });

        FarmerConfiguration configuration = mapper.toEntity(request);

        configuration.setFarmer(farmer);
        configuration.setMilkType(milkType);
        configuration.setCollectionMethod(collectionMethod);
        configuration.setPaymentCycle(paymentCycle);
        configuration.setRateCategory(rateCategory);

        FarmerConfiguration saved = repository.save(configuration);

        return mapper.toResponse(saved);
    }
}