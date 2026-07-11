package com.smartdairy.sales.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateSalesInvoiceItemRequest(

        @NotNull
        UUID productUuid,

        @NotNull
        @DecimalMin("0.001")
        BigDecimal quantity,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal unitPrice

) {
}