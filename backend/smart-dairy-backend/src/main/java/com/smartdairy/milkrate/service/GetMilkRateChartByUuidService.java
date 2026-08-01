package com.smartdairy.milkrate.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.mapper.MilkRateChartMapper;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetMilkRateChartByUuidService {

    private final MilkRateChartRepository repository;
    private final MilkRateChartMapper mapper;

    @Transactional(readOnly = true)
    public MilkRateChartResponse getByUuid(UUID uuid) {
        log.info("Fetching milk rate chart by uuid={}", uuid);
        return repository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() -> {
                    log.warn("Milk rate chart not found for uuid={}", uuid);
                    return new ResourceNotFoundException("Milk Rate Chart not found.");
                });
    }
}
