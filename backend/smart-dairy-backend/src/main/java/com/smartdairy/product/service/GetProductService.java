package com.smartdairy.product.service;

import com.smartdairy.product.dto.ProductResponse;

import java.util.UUID;

public interface GetProductService {

    ProductResponse getByUuid(UUID uuid);

}