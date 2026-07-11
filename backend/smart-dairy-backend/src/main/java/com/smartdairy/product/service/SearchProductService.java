package com.smartdairy.product.service;

import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.ProductSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchProductService {

    Page<ProductResponse> search(
            ProductSearchRequest request,
            Pageable pageable);

}