package com.smartdairy.milkrate.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmerconfiguration.repository.FarmerConfigurationRepository;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DeleteMilkRateChartService {

    private final MilkRateChartRepository repository;
    private final MilkCollectionRepository milkCollectionRepository;
    private final FarmerConfigurationRepository farmerConfigurationRepository;

    @Caching(evict = {
            @CacheEvict(cacheNames = "milkRateCharts", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "milkRateCharts", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)", beforeInvocation = true)
    })
    public void delete(UUID uuid) {
        log.info("Deleting milk rate chart with uuid={}.", uuid);

        MilkRateChart chart = repository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Milk Rate Chart not found."));

        if (milkCollectionRepository.existsByMilkRateChartId(chart.getId())) {
            throw new BusinessException("Cannot delete milk rate chart as it's referenced in milk collections.");
        }

        if (farmerConfigurationRepository.existsByMilkRateChartId(chart.getId())) {
            throw new BusinessException("Cannot delete milk rate chart as it's referenced in farmer configurations.");
        }

        repository.delete(chart);

        log.info("Milk rate chart with uuid={} deleted successfully.", uuid);
    }
}
