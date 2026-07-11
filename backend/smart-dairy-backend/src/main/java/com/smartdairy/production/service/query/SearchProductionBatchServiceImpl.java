package com.smartdairy.production.service.query;

import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.dto.ProductionBatchSearchRequest;
import com.smartdairy.production.mapper.ProductionBatchMapper;
import com.smartdairy.production.repository.ProductionBatchRepository;
import com.smartdairy.production.specification.ProductionBatchSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchProductionBatchServiceImpl
        implements SearchProductionBatchService {

    private final ProductionBatchRepository repository;

    private final ProductionBatchMapper mapper;

    @Override
    public Page<ProductionBatchResponse> search(
            ProductionBatchSearchRequest request,
            Pageable pageable) {

        return repository.findAll(
                        ProductionBatchSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);

    }

}