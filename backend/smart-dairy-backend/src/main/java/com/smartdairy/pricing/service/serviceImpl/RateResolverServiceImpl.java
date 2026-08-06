package com.smartdairy.pricing.service.serviceImpl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import com.smartdairy.pricing.dto.RateCalculationResult;
import com.smartdairy.pricing.service.PricingRateDetailCacheService;
import com.smartdairy.pricing.service.RateResolverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RateResolverServiceImpl implements RateResolverService {

    private final FarmerRepository farmerRepository;
    private final FarmerConfigurationRepository farmerConfigurationRepository;
    private final MilkRateChartRepository milkRateChartRepository;
    private final PricingRateDetailCacheService pricingRateDetailCacheService;


    @Override
    public RateCalculationResult calculateFatRate(
            Farmer farmerUuid,
            LocalDate collectionDate,
            BigDecimal quantity,
            BigDecimal fat,
            BigDecimal snf) {

        Farmer farmer = findFarmer(farmerUuid.getUuid());

        FarmerConfiguration configuration = findFarmerConfiguration(farmer, collectionDate);

        log.debug(
                "Resolving milk rate chart for farmerUuid={}, branchId={}, rateCategoryId={}, collectionMethodId={}, collectionDate={}",
                farmer.getUuid(),
                configuration.getFarmer().getBranch().getId(),
                configuration.getRateCategory().getId(),
                configuration.getCollectionMethod().getId(),
                collectionDate);

        MilkRateChart chart =
                findMilkRateChart(configuration, collectionDate);

        var detail = pricingRateDetailCacheService.findFatRate(chart.getId(), fat, snf);

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

        var detail = pricingRateDetailCacheService.findMavaRate(chart.getId(), mava);

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

    private FarmerConfiguration findFarmerConfiguration(Farmer farmer, LocalDate collectionDate) {
        List<FarmerConfiguration> configs = farmerConfigurationRepository
                .findApplicableConfigurations(farmer.getId(), collectionDate);
        
        if (configs.isEmpty()) {
            String message = "No active farmer configuration found for farmerCode="
                    + farmer.getFarmerCode()
                    + ", farmerUuid="
                    + farmer.getUuid()
                    + " on collectionDate="
                    + collectionDate;
            log.error(message);
            throw new ResourceNotFoundException(message);
        }
        
        if (configs.size() > 1) {
            // Data corruption: Multiple active configs. Log warning and use the most recent one.
            log.warn("Data integrity issue: Found {} active farmer configurations for farmerCode={}, farmerUuid={}, collectionDate={}. Using most recent configuration.",
                    configs.size(), farmer.getFarmerCode(), farmer.getUuid(), collectionDate);
            
            // Deactivate older ones automatically to prevent future issues
            for (int i = 1; i < configs.size(); i++) {
                FarmerConfiguration oldConfig = configs.get(i);
                oldConfig.setActive(false);
                oldConfig.setEffectiveTo(collectionDate.minusDays(1));
                farmerConfigurationRepository.saveAndFlush(oldConfig);
                log.info("Automatically deactivated duplicate farmer configuration (id={}) for farmerUuid={}",
                        oldConfig.getId(), farmer.getUuid());
            }
        }
        
        return configs.get(0);
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