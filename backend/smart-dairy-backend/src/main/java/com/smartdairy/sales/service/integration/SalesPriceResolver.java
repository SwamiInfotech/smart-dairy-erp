package com.smartdairy.sales.service.integration;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SalesPriceResolver {

    private final ProductRepository repository;

    public Product resolve(UUID productUuid) {

        return repository.findByUuid(productUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found."));

    }

}