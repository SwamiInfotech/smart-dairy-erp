package com.smartdairy.master.service;

import com.smartdairy.master.dto.MilkTypeResponse;
import com.smartdairy.master.mapper.MilkTypeMapper;
import com.smartdairy.master.repository.MilkTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetMilkTypeService {

    private final MilkTypeRepository repository;

    private final MilkTypeMapper mapper;

    @Cacheable(
            cacheNames = "milkTypes",
            key = "T(com.smartdairy.config.CacheKeys).tenantKey()"
    )
    public List<MilkTypeResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}