package com.smartdairy.milkcollection.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.milkcollection.mapper.MilkCollectionMapper;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LockMilkCollectionService {

    private final MilkCollectionRepository repository;
    private final MilkCollectionMapper mapper;

    public MilkCollectionResponse lock(UUID uuid) {

        MilkCollection entity = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Milk Collection not found."));

        if (Boolean.TRUE.equals(entity.getLocked())) {
            throw new BusinessException("Milk Collection is already locked.");
        }

        entity.setLocked(true);

        MilkCollection updated = repository.save(entity);

        return mapper.toResponse(updated);
    }
}