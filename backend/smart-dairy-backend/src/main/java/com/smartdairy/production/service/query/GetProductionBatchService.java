package com.smartdairy.production.service.query;

import com.smartdairy.production.dto.ProductionBatchResponse;

import java.util.UUID;

public interface GetProductionBatchService {

    ProductionBatchResponse get(UUID uuid);

}