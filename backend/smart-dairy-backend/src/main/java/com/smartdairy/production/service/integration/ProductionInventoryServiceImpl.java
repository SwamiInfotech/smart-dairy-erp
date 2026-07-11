package com.smartdairy.production.service.integration;

import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
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
public class ProductionInventoryServiceImpl
        implements ProductionInventoryService {

    private final InventoryService inventoryService;

    private final InventoryTransactionRepository inventoryRepository;

    @Override
    public void createInventory(ProductionBatch productionBatch) {

        for (ProductionBatchItem item : productionBatch.getItems()) {

            InventoryTransactionRequest request =
                    buildInventoryRequest(productionBatch, item);

            inventoryService.createTransaction(request);

        }

    }

    @Override
    public void reverseInventory(ProductionBatch productionBatch) {

        inventoryRepository
                .findByReferenceUuidOrderById(productionBatch.getUuid())
                .forEach(inventoryRepository::delete);

    }

    @Override
    public void updateInventory(
            ProductionBatch oldBatch,
            ProductionBatch newBatch) {

        reverseInventory(oldBatch);

        createInventory(newBatch);

    }

    private InventoryTransactionRequest buildInventoryRequest(
            ProductionBatch batch,
            ProductionBatchItem item) {

        if (item.getItemType() == ProductionItemType.CONSUME) {

            return new InventoryTransactionRequest(

                    batch.getBranch().getUuid(),

                    item.getProduct().getUuid(),

                    InventoryTransactionType.PRODUCTION_CONSUMPTION,

                    ReferenceType.PRODUCTION,

                    batch.getUuid(),

                    OffsetDateTime.now(),

                    BigDecimal.ZERO,

                    item.getQuantity(),

                    "Production Consumption : " + batch.getBatchNo()

            );

        }

        return new InventoryTransactionRequest(

                batch.getBranch().getUuid(),

                item.getProduct().getUuid(),

                InventoryTransactionType.PRODUCTION_OUTPUT,

                ReferenceType.PRODUCTION,

                batch.getUuid(),

                OffsetDateTime.now(),

                item.getQuantity(),

                BigDecimal.ZERO,

                "Production Output : " + batch.getBatchNo()

        );

    }

}