package com.smartdairy.sales.dto;

import java.math.BigDecimal;

public record SalesDashboardResponse(

        long totalInvoices,

        BigDecimal totalSales,

        BigDecimal totalDiscount,

        BigDecimal netSales,

        BigDecimal averageInvoiceValue

) {
}