package com.smartdairy.production.dto;

import com.smartdairy.production.enums.ProductionItemType;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductionBatchItemResponse(

        UUID productUuid,

        String productCode,

        String productName,

        ProductionItemType itemType,

        BigDecimal quantity,

        String remarks

) {
}