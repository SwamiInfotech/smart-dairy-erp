package com.smartdairy.milkrate.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkrate.dto.CreateMilkRateChartDetailRequest;
import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.dto.UpdateMilkRateChartRequest;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import com.smartdairy.milkrate.mapper.MilkRateChartMapper;
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
public class UpdateMilkRateChartService {

    private final MilkRateChartRepository repository;
    private final MilkRateChartMapper mapper;

    @Caching(evict = {
            @CacheEvict(cacheNames = "milkRateCharts", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "milkRateCharts", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)", beforeInvocation = true)
    })
    public MilkRateChartResponse update(UUID uuid, UpdateMilkRateChartRequest request) {
        log.info("Updating milk rate chart with uuid={}.", uuid);

        MilkRateChart chart = repository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Milk Rate Chart not found."));

        if (request.effectiveTo() != null && request.effectiveTo().isBefore(request.effectiveFrom())) {
            throw new BusinessException("Effective To must be greater than or equal to Effective From.");
        }

        chart.setChartName(request.chartName());
        chart.setEffectiveFrom(request.effectiveFrom());
        chart.setEffectiveTo(request.effectiveTo());
        chart.setRemarks(request.remarks());

        if (request.active() != null) {
            chart.setActive(request.active());
        }

        chart.getDetails().clear();

        for (CreateMilkRateChartDetailRequest detailRequest : request.details()) {
            MilkRateChartDetail detail = mapper.toEntity(detailRequest);
            detail.setMilkRateChart(chart);
            chart.getDetails().add(detail);
        }

        MilkRateChart updated = repository.save(chart);

        log.info("Milk rate chart with uuid={} updated successfully.", uuid);

        return mapper.toResponse(updated);
    }
}
