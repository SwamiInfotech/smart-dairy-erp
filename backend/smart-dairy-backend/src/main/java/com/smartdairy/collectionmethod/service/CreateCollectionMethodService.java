package com.smartdairy.collectionmethod.service;

import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.dto.CreateCollectionMethodRequest;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.mapper.CollectionMethodMapper;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CreateCollectionMethodService {

    private final CollectionMethodRepository repository;
    private final CollectionMethodMapper mapper;

    public CollectionMethodResponse create(CreateCollectionMethodRequest request) {
        log.info("Creating collection method with code={}", request.getCode());

        if (repository.existsByCodeIgnoreCase(request.getCode())) {
            log.warn("Collection method creation failed because code={} already exists.", request.getCode());
            throw new BusinessException("Collection method code already exists.");
        }

        CollectionMethod entity = mapper.toEntity(request);
        entity.setActive(true);

        CollectionMethod saved = repository.save(entity);
        log.info("Collection method created successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
