package com.smartdairy.report.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CustomerSalesReportResponse(

        UUID customerUuid,

        String customerCode,

        String customerName,

        Long totalInvoices,

        BigDecimal totalQuantity,

        BigDecimal grossSales,

        BigDecimal discount,

        BigDecimal netSales

) {
}