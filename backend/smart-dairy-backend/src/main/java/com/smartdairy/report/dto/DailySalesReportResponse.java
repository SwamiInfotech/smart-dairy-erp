package com.smartdairy.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesReportResponse(

        LocalDate salesDate,

        Long invoiceCount,

        BigDecimal grossSales,

        BigDecimal discount,

        BigDecimal netSales

) {}