package com.smartdairy.collectionmethod.service;

import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.dto.UpdateCollectionMethodRequest;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.mapper.CollectionMethodMapper;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.BusinessException;
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
public class UpdateCollectionMethodService {

    private final CollectionMethodRepository repository;
    private final CollectionMethodMapper mapper;

    @Caching(evict = {
            @CacheEvict(cacheNames = "collectionMethods", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "collectionMethods", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public CollectionMethodResponse update(UUID uuid, UpdateCollectionMethodRequest request) {
        log.info("Updating collection method with uuid={}", uuid);

        CollectionMethod entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Collection method update failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Collection method not found.");
                });

        if (!entity.getCode().equalsIgnoreCase(request.getCode())
                && repository.existsByCodeIgnoreCaseAndUuidNot(request.getCode(), uuid)) {
            log.warn("Collection method update failed because code={} already exists.", request.getCode());
            throw new BusinessException("Collection method code already exists.");
        }

        mapper.updateEntity(request, entity);
        CollectionMethod saved = repository.save(entity);
        log.info("Collection method updated successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
