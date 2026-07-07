package com.smartdairy.milkcollection.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteMilkCollectionService {

    private final MilkCollectionRepository repository;

    public void delete(UUID uuid) {

        MilkCollection entity = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Milk Collection not found."));

        if (Boolean.TRUE.equals(entity.getLocked())) {
            throw new BusinessException(
                    "Locked Milk Collection cannot be deleted.");
        }

        repository.delete(entity);
    }
}