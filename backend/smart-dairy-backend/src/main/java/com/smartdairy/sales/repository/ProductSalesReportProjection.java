package com.smartdairy.sales.repository;

import java.math.BigDecimal;
import java.util.UUID;

public interface ProductSalesReportProjection {

    UUID getProductUuid();

    String getProductCode();

    String getProductName();

    BigDecimal getQuantitySold();

    BigDecimal getTotalAmount();

}