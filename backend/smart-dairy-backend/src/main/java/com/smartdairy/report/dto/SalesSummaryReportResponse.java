package com.smartdairy.report.dto;

import java.math.BigDecimal;

public record SalesSummaryReportResponse(

        Long totalInvoices,

        BigDecimal grossSales,

        BigDecimal totalDiscount,

        BigDecimal netSales,

        BigDecimal averageInvoiceValue

) {
}