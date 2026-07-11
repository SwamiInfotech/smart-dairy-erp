package com.smartdairy.product.service;

import java.util.UUID;

public abstract class ProductUsageService {
    public abstract void validateProductCanBeModified(UUID productUuid);
}
