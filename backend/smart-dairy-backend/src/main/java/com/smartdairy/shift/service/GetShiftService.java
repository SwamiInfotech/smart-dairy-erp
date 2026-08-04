package com.smartdairy.shift.service;

import com.smartdairy.shift.dto.ShiftResponse;
import com.smartdairy.shift.mapper.ShiftMapper;
import com.smartdairy.shift.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetShiftService {

    private final ShiftRepository repository;

    private final ShiftMapper mapper;

    @Cacheable(
            cacheNames = "shifts",
            key = "T(com.smartdairy.config.CacheKeys).tenantKey()"
    )
    public List<ShiftResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
