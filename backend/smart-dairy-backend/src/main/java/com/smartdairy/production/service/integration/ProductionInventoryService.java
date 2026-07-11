package com.smartdairy.production.service.integration;

import com.smartdairy.production.entity.ProductionBatch;

public interface ProductionInventoryService {

    void createInventory(ProductionBatch productionBatch);

    void reverseInventory(ProductionBatch productionBatch);

    void updateInventory(
            ProductionBatch oldBatch,
            ProductionBatch newBatch);

}