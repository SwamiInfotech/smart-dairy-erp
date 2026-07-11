package com.smartdairy.production.dto;

import com.smartdairy.production.enums.ProductionItemType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateProductionBatchItemRequest(

        @NotNull
        UUID productUuid,

        @NotNull
        ProductionItemType itemType,

        @NotNull
        @DecimalMin("0.001")
        BigDecimal quantity,

        String remarks

) {
}