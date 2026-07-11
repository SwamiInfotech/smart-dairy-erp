package com.smartdairy.sales.service.assembler;

import com.smartdairy.sales.dto.CreateSalesInvoiceItemRequest;
import com.smartdairy.sales.dto.CreateSalesInvoiceRequest;
import com.smartdairy.sales.dto.UpdateSalesInvoiceRequest;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.common.enums.PaymentMode;
import com.smartdairy.sales.service.SalesCalculationService;
import com.smartdairy.sales.service.command.SalesInvoiceItemFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class SalesInvoiceAssemblerImpl
        implements SalesInvoiceAssembler {

    private final SalesInvoiceItemFactory itemFactory;

    private final SalesCalculationService calculationService;

    @Override
    public void assemble(SalesInvoice invoice, CreateSalesInvoiceRequest request) {
        populateHeader(invoice, request.paymentMode(), request.invoiceDate(), request.discountAmount(), request.remarks());
        populateItems(invoice, request.items());
    }

    @Override
    public void assemble(SalesInvoice invoice, UpdateSalesInvoiceRequest request) {
        populateHeader(invoice, request.paymentMode(), request.invoiceDate(), request.discountAmount(), request.remarks());

        populateItems(invoice, request.items());

    }

    private void populateItems(SalesInvoice invoice, Iterable<CreateSalesInvoiceItemRequest> items) {

        for (CreateSalesInvoiceItemRequest request : items) {

            invoice.getItems().add(itemFactory.create(invoice, request));
        }

        calculationService.calculate(invoice);

    }

    private void populateHeader(SalesInvoice invoice, PaymentMode paymentMode, java.time.LocalDate invoiceDate, BigDecimal discount, String remarks) {
        invoice.setPaymentMode(paymentMode);
        invoice.setInvoiceDate(invoiceDate);
        invoice.setDiscountAmount(discount);
        invoice.setRemarks(remarks);
    }

}