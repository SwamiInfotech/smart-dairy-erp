package com.smartdairy.sales.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.inventory.dto.CurrentStockResponse;
import com.smartdairy.inventory.service.GetCurrentStockService;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SalesInventoryValidator {

    private final GetCurrentStockService getCurrentStockService;

    public void validate(SalesInvoice invoice) {

        for (SalesInvoiceItem item : invoice.getItems()) {

            CurrentStockResponse stock =
                    getCurrentStockService.getCurrentStock(
                            item.getProduct().getUuid());

            if (stock.currentStock()
                    .compareTo(item.getQuantity()) < 0) {

                throw new BusinessException(
                        "Insufficient stock for Product : "
                                + item.getProduct().getProductCode()
                                + " (Available : "
                                + stock.currentStock()
                                + ", Requested : "
                                + item.getQuantity()
                                + ")");

            }

        }

    }

}