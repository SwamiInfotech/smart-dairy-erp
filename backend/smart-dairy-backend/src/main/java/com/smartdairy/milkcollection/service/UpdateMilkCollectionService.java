package com.smartdairy.milkcollection.service;


import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.dto.UpdateMilkCollectionRequest;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.milkcollection.mapper.MilkCollectionMapper;

import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.milkcollection.validator.MilkCollectionValidator;

import com.smartdairy.pricing.dto.RateCalculationResult;
import com.smartdairy.pricing.service.RateResolverService;
import com.smartdairy.shift.entity.Shift;
import com.smartdairy.shift.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateMilkCollectionService {

    private final MilkCollectionRepository repository;
    private final ShiftRepository shiftRepository;
    private final MilkCollectionMapper mapper;
    private final MilkCollectionValidator validator;
    private final RateResolverService rateResolverService;

    public MilkCollectionResponse update(
            UUID uuid,
            UpdateMilkCollectionRequest request) {

        validator.validate(request);

        MilkCollection entity = findCollection(uuid);

        validateLocked(entity);

        Shift shift = findShift(request.shiftUuid());

        RateCalculationResult result = resolveRate(entity, request);

        entity.setShift(shift);

        entity.setCollectionDate(request.collectionDate());

        entity.setCollectionTime(request.collectionTime());

        entity.setQuantity(request.quantity());

        entity.setFat(request.fat());

        entity.setSnf(request.snf());

        entity.setMava(request.mava());

        entity.setCalculatedRate(result.calculatedRate());

        entity.setGrossAmount(result.grossAmount());

        entity.setRemarks(request.remarks());

        MilkCollection updated = repository.save(entity);

        return mapper.toResponse(updated);
    }

    private MilkCollection findCollection(UUID uuid) {

        return repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Milk Collection not found."));
    }

    private Shift findShift(UUID uuid) {

        return shiftRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shift not found."));
    }

    private void validateLocked(MilkCollection entity) {

        if (Boolean.TRUE.equals(entity.getLocked())) {
            throw new BusinessException(
                    "Milk Collection is locked and cannot be updated.");
        }
    }

    private RateCalculationResult resolveRate(
            MilkCollection entity,
            UpdateMilkCollectionRequest request) {

        if (validator.isFatCollection(request)) {

            return rateResolverService.calculateFatRate(
                    entity.getFarmer(),
                    request.collectionDate(),
                    request.quantity(),
                    request.fat(),
                    request.snf());
        }

        return rateResolverService.calculateMavaRate(
                entity.getFarmer(),
                request.collectionDate(),
                request.quantity(),
                request.mava());
    }
}