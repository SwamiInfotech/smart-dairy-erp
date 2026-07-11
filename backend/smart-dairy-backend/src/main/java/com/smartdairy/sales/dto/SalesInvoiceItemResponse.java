package com.smartdairy.sales.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SalesInvoiceItemResponse(

        UUID productUuid,

        String productCode,

        String productName,

        BigDecimal quantity,

        BigDecimal unitPrice,

        BigDecimal lineTotal

) {
}