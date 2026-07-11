package com.smartdairy.production.service.query;

import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.dto.ProductionBatchSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchProductionBatchService {

    Page<ProductionBatchResponse> search(
            ProductionBatchSearchRequest request,
            Pageable pageable);

}