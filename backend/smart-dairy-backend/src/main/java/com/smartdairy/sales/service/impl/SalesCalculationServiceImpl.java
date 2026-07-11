package com.smartdairy.sales.service.impl;

import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import com.smartdairy.sales.service.SalesCalculationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class SalesCalculationServiceImpl
        implements SalesCalculationService {

    @Override
    public void calculate(SalesInvoice invoice) {

        BigDecimal total = BigDecimal.ZERO;

        for (SalesInvoiceItem item : invoice.getItems()) {

            BigDecimal lineTotal = item.getQuantity()
                    .multiply(item.getUnitPrice());

            item.setLineTotal(lineTotal);

            total = total.add(lineTotal);

        }

        BigDecimal discount =
                invoice.getDiscountAmount() == null
                        ? BigDecimal.ZERO
                        : invoice.getDiscountAmount();

        invoice.setTotalAmount(total);

        invoice.setNetAmount(total.subtract(discount));

    }

}