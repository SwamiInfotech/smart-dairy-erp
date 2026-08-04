package com.smartdairy.pricing.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import com.smartdairy.milkrate.repository.MilkRateChartDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PricingRateDetailCacheService {

    private final MilkRateChartDetailRepository milkRateChartDetailRepository;

    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "milkRateChartDetails",
            key = "T(com.smartdairy.config.CacheKeys).milkRateChartFatRateKey(#chartId, #fat, #snf)")
    public MilkRateChartDetail findFatRate(Long chartId, BigDecimal fat, BigDecimal snf) {
        return milkRateChartDetailRepository.findFatRate(chartId, fat, snf)
                .orElseThrow(() -> new BusinessException("No FAT rate found for the given FAT/SNF."));
    }

    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "milkRateChartDetails",
            key = "T(com.smartdairy.config.CacheKeys).milkRateChartMavaRateKey(#chartId, #mava)")
    public MilkRateChartDetail findMavaRate(Long chartId, BigDecimal mava) {
        return milkRateChartDetailRepository.findMavaRate(chartId, mava)
                .orElseThrow(() -> new BusinessException("No MAVA rate found."));
    }
}
