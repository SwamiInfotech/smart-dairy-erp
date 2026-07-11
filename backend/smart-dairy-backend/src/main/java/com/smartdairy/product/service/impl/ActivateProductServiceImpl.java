package com.smartdairy.product.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.ActivateProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivateProductServiceImpl implements ActivateProductService {

    private final ProductRepository repository;

    @Override
    public void activate(UUID uuid) {

        Product product = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        product.setActive(true);

        repository.save(product);
    }
}