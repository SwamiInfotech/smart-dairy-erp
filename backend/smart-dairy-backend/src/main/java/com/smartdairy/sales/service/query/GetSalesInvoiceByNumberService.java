package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesInvoiceResponse;

public interface GetSalesInvoiceByNumberService {

    SalesInvoiceResponse get(String invoiceNo);

}