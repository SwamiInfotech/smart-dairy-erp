package com.smartdairy.product.service.impl;

import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.ProductSearchRequest;
import com.smartdairy.product.mapper.ProductMapper;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.product.service.SearchProductService;
import com.smartdairy.product.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchProductServiceImpl implements SearchProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    @Override
    public Page<ProductResponse> search(
            ProductSearchRequest request,
            Pageable pageable) {

        return repository.findAll(
                        ProductSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }
}