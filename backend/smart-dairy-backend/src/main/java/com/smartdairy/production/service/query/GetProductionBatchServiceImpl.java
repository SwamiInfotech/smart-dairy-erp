package com.smartdairy.production.service.query;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.entity.ProductionBatch;
import com.smartdairy.production.mapper.ProductionBatchMapper;
import com.smartdairy.production.repository.ProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetProductionBatchServiceImpl
        implements GetProductionBatchService {

    private final ProductionBatchRepository repository;

    private final ProductionBatchMapper mapper;

    @Override
    public ProductionBatchResponse get(UUID uuid) {

        ProductionBatch batch = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Production batch not found."));

        return mapper.toResponse(batch);

    }

}