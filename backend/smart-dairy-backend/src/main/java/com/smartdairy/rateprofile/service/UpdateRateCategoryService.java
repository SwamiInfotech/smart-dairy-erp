package com.smartdairy.rateprofile.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.dto.UpdateRateCategoryRequest;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.mapper.RateCategoryMapper;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UpdateRateCategoryService {

    private final RateCategoryRepository repository;
    private final RateCategoryMapper mapper;

    @Caching(evict = {
            @CacheEvict(cacheNames = "rateCategories", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "rateCategories", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public RateCategoryResponse update(UUID uuid, UpdateRateCategoryRequest request) {
        log.info("Updating rate category with uuid={}", uuid);

        RateCategory entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Rate category update failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Rate category not found.");
                });

        if (!entity.getCode().equalsIgnoreCase(request.getCode())
                && repository.existsByCodeIgnoreCaseAndUuidNot(request.getCode(), uuid)) {
            log.warn("Rate category update failed because code={} already exists.", request.getCode());
            throw new BusinessException("Rate category code already exists.");
        }

        mapper.updateEntity(request, entity);
        RateCategory saved = repository.save(entity);
        log.info("Rate category updated successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
