package com.smartdairy.product.dto;

import com.smartdairy.product.enums.ProductType;
import com.smartdairy.product.enums.UnitType;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(

        UUID uuid,

        String productCode,

        String productName,

        ProductType productType,

        UnitType unitType,

        String description,

        BigDecimal purchasePrice,

        BigDecimal sellingPrice,

        BigDecimal minimumStock,

        Boolean active

) {
}