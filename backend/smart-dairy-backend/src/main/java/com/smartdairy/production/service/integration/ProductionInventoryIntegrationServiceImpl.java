package com.smartdairy.production.service.integration;

import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.production.entity.ProductionBatch;
import com.smartdairy.production.entity.ProductionBatchItem;
import com.smartdairy.production.enums.ProductionItemType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionInventoryIntegrationServiceImpl
        implements ProductionInventoryIntegrationService {

    private final InventoryService inventoryService;

    @Override
    public void processInventory(ProductionBatch productionBatch) {

        for (ProductionBatchItem item : productionBatch.getItems()) {

            InventoryTransactionRequest request;

            if (item.getItemType() == ProductionItemType.CONSUME) {

                request = new InventoryTransactionRequest(

                        productionBatch.getBranch().getUuid(),

                        item.getProduct().getUuid(),

                        InventoryTransactionType.PRODUCTION_CONSUMPTION,

                        ReferenceType.PRODUCTION,

                        productionBatch.getUuid(),

                        OffsetDateTime.now(),

                        BigDecimal.ZERO,

                        item.getQuantity(),

                        "Production Consumption : "
                                + productionBatch.getBatchNo()
                );

            } else {

                request = new InventoryTransactionRequest(

                        productionBatch.getBranch().getUuid(),

                        item.getProduct().getUuid(),

                        InventoryTransactionType.PRODUCTION_OUTPUT,

                        ReferenceType.PRODUCTION,

                        productionBatch.getUuid(),

                        OffsetDateTime.now(),

                        item.getQuantity(),

                        BigDecimal.ZERO,

                        "Production Output : "
                                + productionBatch.getBatchNo()
                );

            }

            inventoryService.createTransaction(request);

        }

    }

}