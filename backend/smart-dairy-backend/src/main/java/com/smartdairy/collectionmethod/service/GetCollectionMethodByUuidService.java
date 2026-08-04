package com.smartdairy.collectionmethod.service;

import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.mapper.CollectionMethodMapper;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCollectionMethodByUuidService {

    private final CollectionMethodRepository repository;
    private final CollectionMethodMapper mapper;

    @Cacheable(cacheNames = "collectionMethods", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    public CollectionMethodResponse getByUuid(UUID uuid) {
        log.info("Fetching collection method by uuid={}", uuid);
        return repository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() -> {
                    log.warn("Collection method not found for uuid={}", uuid);
                    return new ResourceNotFoundException("Collection method not found.");
                });
    }
}
