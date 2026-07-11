package com.smartdairy.production.service.command;

import com.smartdairy.production.dto.CreateProductionBatchRequest;
import com.smartdairy.production.dto.ProductionBatchResponse;

public interface CreateProductionBatchCommandService {

    ProductionBatchResponse create(CreateProductionBatchRequest request);

}