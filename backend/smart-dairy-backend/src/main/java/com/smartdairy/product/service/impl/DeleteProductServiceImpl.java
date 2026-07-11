package com.smartdairy.product.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.DeleteProductService;
import com.smartdairy.product.service.ProductUsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteProductServiceImpl implements DeleteProductService {

    private final ProductRepository repository;
    private final ProductUsageService productUsageService;

    @Override
    public void delete(UUID uuid) {

        Product product = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        productUsageService.validateProductCanBeModified(
                product.getUuid());

        product.setActive(false);

        repository.save(product);
    }
}