package com.smartdairy.product.service;

import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.UpdateProductRequest;

import java.util.UUID;

public interface UpdateProductService {

    ProductResponse update(UUID uuid,
                           UpdateProductRequest request);

}