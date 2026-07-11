package com.smartdairy.sales.service;

import java.math.BigDecimal;

public interface SalesAmountCalculator {

    BigDecimal calculateLineTotal(
            BigDecimal quantity,
            BigDecimal unitPrice);

}