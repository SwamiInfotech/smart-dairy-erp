package com.smartdairy.milkcollection.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.master.entity.MilkType;
import com.smartdairy.master.repository.MilkTypeRepository;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateMilkCollectionService {

    private final MilkCollectionRepository repository;
    private final FarmerRepository farmerRepository;
    private final ShiftRepository shiftRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final MilkCollectionMapper mapper;
    private final MilkCollectionValidator validator;
    private final RateResolverService rateResolverService;

    public MilkCollectionResponse create(CreateMilkCollectionRequest request) {

        validator.validate(request);

        Farmer farmer = findFarmer(request.farmerUuid());

        Shift shift = findShift(request.shiftUuid());

        MilkType milkType = findMilkType(request.milkTypeUuid());

        RateCalculationResult result =
                resolveRate(request, farmer);

        MilkCollection entity = mapper.toEntity(request);

        entity.setCollectionNo(generateCollectionNo());

        entity.setBranch(farmer.getBranch());

        entity.setFarmer(farmer);

        entity.setFarmerConfiguration(result.farmerConfiguration());

        entity.setMilkRateChart(result.milkRateChart());

        entity.setShift(shift);

        entity.setMilkType(milkType);

        entity.setCollectionMethod(
                result.farmerConfiguration().getCollectionMethod());

        entity.setCalculatedRate(result.calculatedRate());

        entity.setGrossAmount(result.grossAmount());

        MilkCollection saved = repository.save(entity);

        return mapper.toResponse(saved);
    }

    private MilkType findMilkType(UUID uuid) {

        return milkTypeRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Milk Type not found."));
    }

    private Shift findShift(UUID uuid) {

        return shiftRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Shift not found."));
    }

    private Farmer findFarmer(UUID uuid) {

        return farmerRepository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));
    }

    private RateCalculationResult resolveRate(
            CreateMilkCollectionRequest request,
            Farmer farmer) {

        if (validator.isFatCollection(request)) {

            return rateResolverService.calculateFatRate(
                    farmer,
                    request.collectionDate(),
                    request.quantity(),
                    request.fat(),
                    request.snf());
        }

        return rateResolverService.calculateMavaRate(
                farmer,
                request.collectionDate(),
                request.quantity(),
                request.mava());
    }

    private String generateCollectionNo() {

        return "MC"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}