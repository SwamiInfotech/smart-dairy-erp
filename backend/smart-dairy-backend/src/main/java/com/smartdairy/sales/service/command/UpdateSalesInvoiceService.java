package com.smartdairy.sales.service.command;

import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.dto.UpdateSalesInvoiceRequest;

import java.util.UUID;

public interface UpdateSalesInvoiceService {

    SalesInvoiceResponse update(
            UUID uuid,
            UpdateSalesInvoiceRequest request);

}