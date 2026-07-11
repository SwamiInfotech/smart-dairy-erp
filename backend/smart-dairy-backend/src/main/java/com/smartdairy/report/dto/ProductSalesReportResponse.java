package com.smartdairy.report.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSalesReportResponse(

        UUID productUuid,

        String productCode,

        String productName,

        BigDecimal quantitySold,

        BigDecimal salesAmount,

        BigDecimal averageSellingPrice

) {
}