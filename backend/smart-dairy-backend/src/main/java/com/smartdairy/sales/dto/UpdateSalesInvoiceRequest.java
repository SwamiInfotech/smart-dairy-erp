package com.smartdairy.sales.dto;

import com.smartdairy.common.enums.PaymentMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateSalesInvoiceRequest(

        @NotNull
        LocalDate invoiceDate,

        @NotNull
        UUID customerUuid,

        @NotNull
        PaymentMode paymentMode,

        @DecimalMin("0.00")
        BigDecimal discountAmount,

        String remarks,

        @Valid
        @NotEmpty
        List<CreateSalesInvoiceItemRequest> items

) {
}