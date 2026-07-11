package com.smartdairy.product.service;

import com.smartdairy.product.dto.CreateProductRequest;
import com.smartdairy.product.dto.ProductResponse;

public interface CreateProductService {

    ProductResponse create(CreateProductRequest request);

}