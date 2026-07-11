package com.smartdairy.product.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.GetProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetProductServiceImpl implements GetProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    @Override
    public ProductResponse getByUuid(UUID uuid) {

        return repository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found."));
    }
}