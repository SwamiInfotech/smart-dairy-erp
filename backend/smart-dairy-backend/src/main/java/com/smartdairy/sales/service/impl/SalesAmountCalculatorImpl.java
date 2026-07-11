package com.smartdairy.sales.service.impl;

import com.smartdairy.sales.service.SalesAmountCalculator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class SalesAmountCalculatorImpl
        implements SalesAmountCalculator {

    @Override
    public BigDecimal calculateLineTotal(
            BigDecimal quantity,
            BigDecimal unitPrice) {

        return quantity.multiply(unitPrice);

    }

}