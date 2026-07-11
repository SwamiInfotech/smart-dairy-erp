package com.smartdairy.inventory.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.inventory.dto.InventoryTransactionRequest;
import com.smartdairy.inventory.enums.InventoryTransactionType;
import com.smartdairy.inventory.enums.ReferenceType;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.InventoryService;
import com.smartdairy.inventory.service.MilkInventoryService;
import com.smartdairy.milkcollection.entity.MilkCollection;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.enums.ProductType;
import com.smartdairy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class MilkInventoryServiceImpl implements MilkInventoryService {

    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final InventoryTransactionRepository repository;

    @Override
    public void stockIn(MilkCollection milkCollection) {

        Product product = findRawMilkProduct(milkCollection);

        inventoryService.createTransaction(
                new InventoryTransactionRequest(
                        milkCollection.getBranch().getUuid(),
                        product.getUuid(),
                        InventoryTransactionType.MILK_COLLECTION,
                        ReferenceType.MILK_COLLECTION,
                        milkCollection.getUuid(),
                        OffsetDateTime.now(),
                        milkCollection.getQuantity(),
                        BigDecimal.ZERO,
                        "Milk Collection : " + milkCollection.getCollectionNo()
                ));
    }

    private Product findRawMilkProduct(MilkCollection milkCollection) {

        String productName = milkCollection.getMilkType().getName();

        return productRepository.findByProductNameIgnoreCase(productName)
                .filter(product -> product.getProductType() == ProductType.RAW_MILK)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Raw milk product not found : " + productName));
    }

    @Override
    public void updateStock(MilkCollection oldCollection,
                            MilkCollection updatedCollection) {

        reverseStock(oldCollection);

        stockIn(updatedCollection);
    }

    @Override
    public void reverseStock(MilkCollection milkCollection) {

        repository.findByReferenceUuidOrderById(
                        milkCollection.getUuid())
                .forEach(repository::delete);
    }
}