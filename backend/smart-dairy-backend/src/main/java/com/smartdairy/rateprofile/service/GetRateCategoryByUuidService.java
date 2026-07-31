package com.smartdairy.rateprofile.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.mapper.RateCategoryMapper;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetRateCategoryByUuidService {

    private final RateCategoryRepository repository;
    private final RateCategoryMapper mapper;

    public RateCategoryResponse getByUuid(UUID uuid) {
        log.info("Fetching rate category by uuid={}", uuid);
        return repository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() -> {
                    log.warn("Rate category not found for uuid={}", uuid);
                    return new ResourceNotFoundException("Rate category not found.");
                });
    }
}
