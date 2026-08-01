package com.smartdairy.milkrate.service;

import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.mapper.MilkRateChartMapper;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetMilkRateChartService {

    private final MilkRateChartRepository repository;
    private final MilkRateChartMapper mapper;

    @Transactional(readOnly = true)
    public List<MilkRateChartResponse> getAll() {
        log.info("Fetching all milk rate charts.");
        List<MilkRateChartResponse> response = repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
        log.info("Fetched {} milk rate charts.", response.size());
        return response;
    }
}
