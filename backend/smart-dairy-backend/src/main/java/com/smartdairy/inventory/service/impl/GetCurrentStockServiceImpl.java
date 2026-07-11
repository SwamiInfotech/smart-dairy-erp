package com.smartdairy.inventory.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.inventory.dto.CurrentStockResponse;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.GetCurrentStockService;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetCurrentStockServiceImpl implements GetCurrentStockService {

    private final ProductRepository productRepository;

    private final InventoryTransactionRepository repository;

    @Override
    public CurrentStockResponse getCurrentStock(
            UUID productUuid) {

        Product product = productRepository.findByUuid(productUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found."));

        BigDecimal stock =
                repository.getCurrentStock(productUuid);

        if (stock == null) {
            stock = BigDecimal.ZERO;
        }

        return new CurrentStockResponse(
                product.getUuid(),
                product.getProductCode(),
                product.getProductName(),
                stock);
    }
}