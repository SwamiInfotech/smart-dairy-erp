package com.smartdairy.inventory.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CurrentStockResponse(

        UUID productUuid,

        String productCode,

        String productName,

        BigDecimal currentStock

) {
}