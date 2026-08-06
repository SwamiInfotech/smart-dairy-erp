package com.smartdairy.product.dto;

import java.util.UUID;

public record ProductCodeDebugResponse(
        UUID tenantUuid,
        long totalProducts,
        String maxDetectedProductCode,
        String nextProductCode
) {
}
