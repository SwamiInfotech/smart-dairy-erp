package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesInvoiceResponse;

import java.util.UUID;

public interface GetSalesInvoiceByUuidService {

    SalesInvoiceResponse get(UUID uuid);

}