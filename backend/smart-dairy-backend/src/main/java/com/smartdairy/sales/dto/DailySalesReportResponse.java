package com.smartdairy.sales.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesReportResponse(

        LocalDate salesDate,

        Long totalInvoices,

        BigDecimal totalSales,

        BigDecimal totalDiscount,

        BigDecimal netSales

) {
}