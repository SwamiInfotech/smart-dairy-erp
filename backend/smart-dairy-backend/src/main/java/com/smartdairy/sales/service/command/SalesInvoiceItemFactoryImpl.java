package com.smartdairy.sales.service.command;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.product.entity.Product;
import com.smartdairy.product.repository.ProductRepository;
import com.smartdairy.sales.dto.CreateSalesInvoiceItemRequest;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import com.smartdairy.sales.service.SalesAmountCalculator;
import com.smartdairy.sales.service.integration.SalesPriceResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class SalesInvoiceItemFactoryImpl implements SalesInvoiceItemFactory {

    private final ProductRepository productRepository;
    private final SalesPriceResolver salesPriceResolver;
    private final SalesAmountCalculator calculator;

    @Override
    public SalesInvoiceItem create(SalesInvoice invoice, CreateSalesInvoiceItemRequest request) {

        Product product = salesPriceResolver.resolve(request.productUuid());
        SalesInvoiceItem item = new SalesInvoiceItem();

        item.setSalesInvoice(invoice);
        item.setProduct(product);
        item.setQuantity(request.quantity());
        item.setUnitPrice(request.unitPrice());
        item.setLineTotal(calculator.calculateLineTotal(request.quantity(), request.unitPrice()));

        return item;
    }
}