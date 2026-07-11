package com.smartdairy.sales.repository;

import java.math.BigDecimal;

public interface CustomerSalesReportProjection {

    String getCustomerName();

    String getCustomerMobile();

    Long getTotalInvoices();

    BigDecimal getTotalSales();

    BigDecimal getTotalDiscount();

    BigDecimal getNetSales();

}