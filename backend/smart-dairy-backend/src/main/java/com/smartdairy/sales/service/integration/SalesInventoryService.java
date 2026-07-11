package com.smartdairy.sales.service.integration;

import com.smartdairy.sales.entity.SalesInvoice;

public interface SalesInventoryService {

    void deductInventory(SalesInvoice invoice);

    void reverseInventory(SalesInvoice invoice);

    void updateInventory(
            SalesInvoice oldInvoice,
            SalesInvoice newInvoice);

}