package com.smartdairy.sales.repository;

import java.math.BigDecimal;

public interface SalesDashboardProjection {

    Long getTotalInvoices();

    BigDecimal getTotalSales();

    BigDecimal getTotalDiscount();

    BigDecimal getNetSales();

}