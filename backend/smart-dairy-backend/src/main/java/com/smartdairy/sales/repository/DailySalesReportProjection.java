package com.smartdairy.sales.repository;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailySalesReportProjection {

    LocalDate getSalesDate();

    Long getTotalInvoices();

    BigDecimal getTotalSales();

    BigDecimal getTotalDiscount();

    BigDecimal getNetSales();

}