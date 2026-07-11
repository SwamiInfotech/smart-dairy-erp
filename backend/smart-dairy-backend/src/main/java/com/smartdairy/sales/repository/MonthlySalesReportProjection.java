package com.smartdairy.sales.repository;

import java.math.BigDecimal;

public interface MonthlySalesReportProjection {

    Integer getYear();

    Integer getMonth();

    Long getTotalInvoices();

    BigDecimal getTotalSales();

    BigDecimal getTotalDiscount();

    BigDecimal getNetSales();

}