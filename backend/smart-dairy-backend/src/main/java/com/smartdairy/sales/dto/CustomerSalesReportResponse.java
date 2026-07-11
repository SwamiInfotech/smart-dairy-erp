package com.smartdairy.sales.dto;

import java.math.BigDecimal;

public record CustomerSalesReportResponse(

        String customerName,

        String customerMobile,

        Long totalInvoices,

        BigDecimal totalSales,

        BigDecimal totalDiscount,

        BigDecimal netSales

) {
}