package com.smartdairy.collectionmethod.service;

import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.mapper.CollectionMethodMapper;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetCollectionMethodService {

    private final CollectionMethodRepository repository;
    private final CollectionMethodMapper mapper;

    @Cacheable(
            cacheNames = "collectionMethods",
            key = "T(com.smartdairy.config.CacheKeys).tenantKey()"
    )
    public List<CollectionMethodResponse> getAll() {
        log.info("Fetching all collection methods.");
        List<CollectionMethodResponse> response = repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
        log.info("Fetched {} collection methods.", response.size());
        return response;
    }
}
