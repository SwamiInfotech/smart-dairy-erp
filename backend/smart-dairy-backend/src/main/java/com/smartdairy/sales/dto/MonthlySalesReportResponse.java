package com.smartdairy.sales.dto;

import java.math.BigDecimal;

public record MonthlySalesReportResponse(

        Integer year,

        Integer month,

        Long totalInvoices,

        BigDecimal totalSales,

        BigDecimal totalDiscount,

        BigDecimal netSales

) {
}