package com.smartdairy.collectionmethod.service;

import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.ResourceNotFoundException;
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
public class DeleteCollectionMethodService {

    private final CollectionMethodRepository repository;

    @Caching(evict = {
            @CacheEvict(cacheNames = "collectionMethods", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "collectionMethods", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public void delete(UUID uuid) {
        log.info("Deleting collection method with uuid={}", uuid);

        CollectionMethod entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Collection method delete failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Collection method not found.");
                });

        entity.setActive(false);
        repository.save(entity);
        log.info("Collection method deleted successfully with uuid={}", uuid);
    }
}
