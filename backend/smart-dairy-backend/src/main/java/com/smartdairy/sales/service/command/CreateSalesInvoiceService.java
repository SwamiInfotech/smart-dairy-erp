package com.smartdairy.sales.service.command;

import com.smartdairy.sales.dto.CreateSalesInvoiceRequest;
import com.smartdairy.sales.dto.SalesInvoiceResponse;

public interface CreateSalesInvoiceService {

    SalesInvoiceResponse create(CreateSalesInvoiceRequest request);

}