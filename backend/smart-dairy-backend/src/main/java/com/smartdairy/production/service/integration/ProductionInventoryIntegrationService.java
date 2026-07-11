package com.smartdairy.production.service.integration;

import com.smartdairy.production.entity.ProductionBatch;

public interface ProductionInventoryIntegrationService {

    void processInventory(ProductionBatch productionBatch);

}