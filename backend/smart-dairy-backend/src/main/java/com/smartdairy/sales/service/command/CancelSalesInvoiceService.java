package com.smartdairy.sales.service.command;

import com.smartdairy.sales.dto.SalesInvoiceResponse;

import java.util.UUID;

public interface CancelSalesInvoiceService {

    SalesInvoiceResponse cancel(UUID uuid);

}