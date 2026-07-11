package com.smartdairy.product.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.product.service.ProductUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductUsageServiceImpl extends ProductUsageService {

    private final InventoryTransactionRepository inventoryRepository;

    @Override
    public void validateProductCanBeModified(UUID productUuid) {

        if (inventoryRepository.existsByProductUuid(productUuid)) {

            throw new BusinessException(
                    "Product is already used in inventory and cannot be modified.");
        }

        /*
         * Future validations
         *
         * productionBatchItemRepository.existsByProductUuid(...)
         *
         * salesItemRepository.existsByProductUuid(...)
         *
         * purchaseItemRepository.existsByProductUuid(...)
         *
         */

    }

}