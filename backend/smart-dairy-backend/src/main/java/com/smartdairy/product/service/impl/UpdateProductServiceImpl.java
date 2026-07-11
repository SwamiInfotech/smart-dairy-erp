package com.smartdairy.product.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.UpdateProductRequest;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.UpdateProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateProductServiceImpl implements UpdateProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    @Override
    public ProductResponse update(UUID uuid,
                                  UpdateProductRequest request) {

        Product product = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));

        if (!product.getProductCode().equalsIgnoreCase(request.getProductCode())
                && repository.existsByProductCode(request.getProductCode())) {
            throw new BusinessException("Product code already exists.");
        }

        mapper.updateEntity(request, product);

        return mapper.toResponse(repository.save(product));
    }
}