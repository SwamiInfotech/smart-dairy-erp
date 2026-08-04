package com.smartdairy.rateprofile.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.rateprofile.entity.RateCategory;
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
public class DeleteRateCategoryService {

    private final RateCategoryRepository repository;

    @Caching(evict = {
            @CacheEvict(cacheNames = "rateCategories", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "rateCategories", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public void delete(UUID uuid) {
        log.info("Deleting rate category with uuid={}", uuid);

        RateCategory entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Rate category delete failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Rate category not found.");
                });

        entity.setActive(false);
        repository.save(entity);
        log.info("Rate category deleted successfully with uuid={}", uuid);
    }
}
