package com.smartdairy.sales.service.command;

import com.smartdairy.sales.dto.CreateSalesInvoiceItemRequest;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;

public interface SalesInvoiceItemFactory {

    SalesInvoiceItem create(
            SalesInvoice invoice,
            CreateSalesInvoiceItemRequest request);

}