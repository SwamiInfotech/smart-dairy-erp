package com.smartdairy.pricing.service.serviceImpl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import com.smartdairy.milkrate.repository.MilkRateChartDetailRepository;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import com.smartdairy.pricing.dto.RateCalculationResult;
import com.smartdairy.pricing.service.RateResolverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RateResolverServiceImpl implements RateResolverService {

    private final FarmerRepository farmerRepository;
    private final FarmerConfigurationRepository farmerConfigurationRepository;
    private final MilkRateChartRepository milkRateChartRepository;
    private final MilkRateChartDetailRepository milkRateChartDetailRepository;


    @Override
    public RateCalculationResult calculateFatRate(
            Farmer farmerUuid,
            LocalDate collectionDate,
            BigDecimal quantity,
            BigDecimal fat,
            BigDecimal snf) {

        Farmer farmer = findFarmer(farmerUuid.getUuid());

        FarmerConfiguration configuration =
                findFarmerConfiguration(farmer, collectionDate);

        System.out.println("========== Milk Rate Chart Lookup ==========");
        System.out.println("Branch Id         : " + configuration.getFarmer().getBranch().getId());
        System.out.println("Rate Category Id  : " + configuration.getRateCategory().getId());
        System.out.println("Collection Method : " + configuration.getCollectionMethod().getId());
        System.out.println("Collection Date   : " + collectionDate);
        System.out.println("============================================");

        MilkRateChart chart =
                findMilkRateChart(configuration, collectionDate);

        MilkRateChartDetail detail =
                milkRateChartDetailRepository
                        .findFatRate(chart.getId(), fat, snf)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "No FAT rate found for the given FAT/SNF."));

        BigDecimal amount = calculateAmount(quantity, detail.getRate());

        return new RateCalculationResult(
                configuration,
                chart,
                detail.getRate(),
                amount);
    }


    @Override
    public RateCalculationResult calculateMavaRate(
            Farmer farmerUuid,
            LocalDate collectionDate,
            BigDecimal quantity,
            BigDecimal mava) {

        Farmer farmer = findFarmer(farmerUuid.getUuid());

        FarmerConfiguration configuration =
                findFarmerConfiguration(farmer, collectionDate);

        MilkRateChart chart =
                findMilkRateChart(configuration, collectionDate);

        MilkRateChartDetail detail =
                milkRateChartDetailRepository
                        .findMavaRate(chart.getId(), mava)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "No MAVA rate found."));

        BigDecimal amount = calculateAmount(quantity, detail.getRate());

        return new RateCalculationResult(
                configuration,
                chart,
                detail.getRate(),
                amount);
    }

    private Farmer findFarmer(UUID farmerUuid) {

        return farmerRepository.findByUuid(farmerUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));
    }

    private FarmerConfiguration findFarmerConfiguration(
            Farmer farmer,
            LocalDate collectionDate) {

        return farmerConfigurationRepository
                .findApplicableConfiguration(
                        farmer.getId(),
                        collectionDate)
                .orElseThrow(() ->
                        new BusinessException(
                                "Farmer configuration not found."));
    }

    private MilkRateChart findMilkRateChart(FarmerConfiguration configuration, LocalDate collectionDate) {
        return milkRateChartRepository
                .findApplicableChart(
                        configuration.getFarmer().getBranch().getId(),
                        configuration.getRateCategory().getId(),
                        configuration.getCollectionMethod().getId(),
                        collectionDate)
                .orElseThrow(() ->
                        new BusinessException(
                                "Milk Rate Chart not found."));
    }

    private BigDecimal calculateAmount(
            BigDecimal quantity,
            BigDecimal rate) {

        return quantity.multiply(rate)
                .setScale(2, RoundingMode.HALF_UP);
    }

}