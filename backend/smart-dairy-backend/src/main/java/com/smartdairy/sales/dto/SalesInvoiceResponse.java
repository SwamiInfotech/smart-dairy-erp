package com.smartdairy.sales.dto;

import com.smartdairy.common.enums.PaymentMode;
import com.smartdairy.sales.enums.SalesStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SalesInvoiceResponse(

        UUID uuid,

        String invoiceNo,

        LocalDate invoiceDate,

        UUID customerUuid,

        String customerCode,

        String customerName,

        String customerMobile,

        PaymentMode paymentMode,

        BigDecimal totalAmount,

        BigDecimal discountAmount,

        BigDecimal netAmount,

        SalesStatus status,

        String remarks,

        List<SalesInvoiceItemResponse> items

) {
}