package com.smartdairy.sales.service.assembler;

import com.smartdairy.sales.dto.CreateSalesInvoiceRequest;
import com.smartdairy.sales.dto.UpdateSalesInvoiceRequest;
import com.smartdairy.sales.entity.SalesInvoice;

public interface SalesInvoiceAssembler {

    void assemble(
            SalesInvoice invoice,
            CreateSalesInvoiceRequest request);

    void assemble(
            SalesInvoice invoice,
            UpdateSalesInvoiceRequest request);

}