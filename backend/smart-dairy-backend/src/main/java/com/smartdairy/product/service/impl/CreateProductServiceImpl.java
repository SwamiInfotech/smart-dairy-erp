package com.smartdairy.product.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.product.dto.CreateProductRequest;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.CreateProductService;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateProductServiceImpl implements CreateProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    @Override
    public ProductResponse create(CreateProductRequest request) {
        UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();

        if (repository.existsByProductCodeAndTenantUuid(request.getProductCode(), tenantUuid)) {
            throw new BusinessException("Product code already exists.");
        }

        if (repository.existsByProductNameIgnoreCaseAndTenantUuid(request.getProductName(), tenantUuid)) {
            throw new BusinessException("Product name already exists.");
        }

        Product product = mapper.toEntity(request);
        product.setActive(true);

        return mapper.toResponse(repository.save(product));
    }
}