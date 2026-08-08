package com.smartdairy.farmer.service;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.entity.Farmer;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FarmerConfigurationUpsertService {

    private static final Pattern EVERY_DAYS_PATTERN = Pattern.compile("EVERY[_\\s-]?(\\d{1,2})[_\\s-]?DAYS?", Pattern.CASE_INSENSITIVE);

    private final FarmerConfigurationRepository farmerConfigurationRepository;
    private final FarmerRepository farmerRepository;
    private final MilkTypeRepository milkTypeRepository;
    private final CollectionMethodRepository collectionMethodRepository;
    private final PaymentCycleRepository paymentCycleRepository;
    private final RateCategoryRepository rateCategoryRepository;
    private final MilkRateChartRepository milkRateChartRepository;

    public void upsert(Farmer farmer, CreateFarmerRequest request) {
        UUID milkTypeUuid = resolveMilkTypeUuid(request);
        UUID collectionMethodUuid = resolveCollectionMethodUuid(request);
        UUID paymentCycleUuid = resolvePaymentCycleUuid(request);
        UUID rateCategoryUuid = resolveRateCategoryUuid(request);
        UUID milkRateChartUuid = resolveMilkRateChartUuid(request);
        LocalDate effectiveFrom = resolveConfigEffectiveFrom(request);

        if (milkTypeUuid == null || collectionMethodUuid == null || paymentCycleUuid == null
                || rateCategoryUuid == null || milkRateChartUuid == null || effectiveFrom == null) {
            throw new BusinessException("Farmer configuration details are required.");
        }

        FarmerConfiguration existing = farmerConfigurationRepository
                .findByFarmerIdAndActiveTrue(farmer.getId())
                .orElse(null);

        if (isSameConfiguration(existing, milkTypeUuid, collectionMethodUuid, paymentCycleUuid, rateCategoryUuid, milkRateChartUuid, effectiveFrom)) {
            log.debug("Farmer configuration unchanged for farmerUuid={}; skipping new configuration version.", farmer.getUuid());
            return;
        }

        /*if (existing != null && effectiveFrom.isBefore(existing.getEffectiveFrom())) {
            throw new BusinessException("Configuration Effective From cannot be before existing configuration date.");
        }*/

        MilkType milkType = milkTypeRepository.findByUuid(milkTypeUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Milk Type not found."));

        CollectionMethod collectionMethod = collectionMethodRepository.findByUuid(collectionMethodUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Collection Method not found."));

        PaymentCycle paymentCycle = paymentCycleRepository.findByUuid(paymentCycleUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Payment Cycle not found."));

        RateCategory rateCategory = rateCategoryRepository.findByUuid(rateCategoryUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Rate Category not found."));

        MilkRateChart milkRateChart = milkRateChartRepository.findByUuid(milkRateChartUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Milk Rate Chart not found."));

        validateMilkRateChart(milkRateChart, farmer.getBranch(), rateCategory, collectionMethod);

        if (existing != null && effectiveFrom.equals(existing.getEffectiveFrom())) {
            // Deactivate all other active configs before updating this one
            List<FarmerConfiguration> otherConfigs = farmerConfigurationRepository
                    .findByFarmerIdAndActiveTrueOrderByEffectiveFromDesc(farmer.getId());
            for (FarmerConfiguration config : otherConfigs) {
                if (!config.getId().equals(existing.getId())) {
                    config.setActive(false);
                    config.setEffectiveTo(effectiveFrom.minusDays(1));
                    farmerConfigurationRepository.saveAndFlush(config);
                }
            }

            existing.setMilkType(milkType);
            existing.setCollectionMethod(collectionMethod);
            existing.setPaymentCycle(paymentCycle);
            existing.setRateCategory(rateCategory);
            existing.setMilkRateChart(milkRateChart);
            existing.setActive(true);
            existing.setEffectiveTo(null);

            farmer.setMilkRateChart(milkRateChart);
            farmerRepository.saveAndFlush(farmer);
            farmerConfigurationRepository.saveAndFlush(existing);
            log.info("Farmer configuration updated in-place for farmerUuid={}, effectiveFrom={}", farmer.getUuid(), effectiveFrom);
            return;
        }

        if (existing != null) {
            existing.setEffectiveTo(effectiveFrom.minusDays(1));
            existing.setActive(false);
            farmerConfigurationRepository.saveAndFlush(existing);
        }

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
        farmerRepository.saveAndFlush(farmer);
        farmerConfigurationRepository.saveAndFlush(configuration);
    }

    private boolean isSameConfiguration(
            FarmerConfiguration existing,
            UUID milkTypeUuid,
            UUID collectionMethodUuid,
            UUID paymentCycleUuid,
            UUID rateCategoryUuid,
            UUID milkRateChartUuid,
            LocalDate effectiveFrom
    ) {
        if (existing == null) {
            return false;
        }

        return existing.getMilkType() != null
                && existing.getCollectionMethod() != null
                && existing.getPaymentCycle() != null
                && existing.getRateCategory() != null
                && existing.getMilkRateChart() != null
                && milkTypeUuid.equals(existing.getMilkType().getUuid())
                && collectionMethodUuid.equals(existing.getCollectionMethod().getUuid())
                && paymentCycleUuid.equals(existing.getPaymentCycle().getUuid())
                && rateCategoryUuid.equals(existing.getRateCategory().getUuid())
                && milkRateChartUuid.equals(existing.getMilkRateChart().getUuid())
                && effectiveFrom.equals(existing.getEffectiveFrom());
    }

    private void validateMilkRateChart(
            MilkRateChart milkRateChart,
            Branch branch,
            RateCategory rateCategory,
            CollectionMethod collectionMethod
    ) {
        if (!milkRateChart.getBranch().getId().equals(branch.getId())) {
            throw new BusinessException("Milk Rate Chart does not belong to farmer branch.");
        }

        if (!milkRateChart.getRateCategory().getId().equals(rateCategory.getId())) {
            throw new BusinessException("Milk Rate Chart does not match rate category.");
        }

        if (!milkRateChart.getCollectionMethod().getId().equals(collectionMethod.getId())) {
            throw new BusinessException("Milk Rate Chart does not match collection method.");
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
        String billingCycleToken = request.farmerConfiguration() != null
                ? request.farmerConfiguration().billingCycle()
                : request.billingCycle();

        String normalizedBillingCycleCode = normalizeBillingCycleCode(billingCycleToken);
        if (normalizedBillingCycleCode != null) {
            PaymentCycle matchedByCode = paymentCycleRepository.findByCode(normalizedBillingCycleCode).orElse(null);
            if (matchedByCode != null) {
                return matchedByCode.getUuid();
            }

            PaymentCycle created = new PaymentCycle();
            created.setCode(normalizedBillingCycleCode);
            created.setName(normalizedBillingCycleCode.replace('_', ' '));
            created.setDescription("Auto-created from farmer billing cycle selection");
            Integer displayOrder = extractDisplayOrder(normalizedBillingCycleCode);
            if (displayOrder != null) {
                created.setDisplayOrder(displayOrder);
            }
            created.setActive(true);

            return paymentCycleRepository.saveAndFlush(created).getUuid();
        }

        if (request.farmerConfiguration() != null && request.farmerConfiguration().paymentCycleUuid() != null) {
            return request.farmerConfiguration().paymentCycleUuid();
        }
        return request.paymentCycleUuid();
    }

    private String normalizeBillingCycleCode(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return null;
        }

        String normalized = raw.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        Matcher matcher = EVERY_DAYS_PATTERN.matcher(normalized);
        if (matcher.find()) {
            int days = Integer.parseInt(matcher.group(1));
            if (days >= 2 && days <= 30) {
                normalized = "EVERY_" + days + "_DAYS";
            }
        }

        if ("DAILY".equals(normalized) || "WEEKLY".equals(normalized) || "MONTHLY".equals(normalized)) {
            return normalized;
        }

        return normalized.matches("EVERY_\\d{1,2}_DAYS") ? normalized : null;
    }

    private Integer extractDisplayOrder(String normalizedCode) {
        if ("DAILY".equals(normalizedCode)) {
            return 1;
        }
        if ("WEEKLY".equals(normalizedCode)) {
            return 7;
        }
        if ("MONTHLY".equals(normalizedCode)) {
            return 30;
        }

        Matcher matcher = Pattern.compile("EVERY_(\\d{1,2})_DAYS").matcher(normalizedCode);
        if (!matcher.matches()) {
            return null;
        }

        int days = Integer.parseInt(matcher.group(1));
        return days >= 2 && days <= 30 ? days : null;
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
