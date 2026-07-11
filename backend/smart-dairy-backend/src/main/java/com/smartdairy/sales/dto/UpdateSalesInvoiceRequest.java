package com.smartdairy.sales.dto;

import com.smartdairy.sales.enums.PaymentMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateSalesInvoiceRequest(

        @NotNull
        LocalDate invoiceDate,

        @NotBlank
        String customerName,

        String customerMobile,

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