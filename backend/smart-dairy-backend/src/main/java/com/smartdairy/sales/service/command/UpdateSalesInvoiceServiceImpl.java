package com.smartdairy.sales.service.command;

import com.smartdairy.customer.enums.CustomerLedgerReferenceType;
import com.smartdairy.customer.service.CustomerLedgerService;
import com.smartdairy.customer.service.integration.CustomerLookupService;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.dto.UpdateSalesInvoiceRequest;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import com.smartdairy.sales.service.SalesCalculationService;
import com.smartdairy.sales.service.integration.SalesInventoryService;
import com.smartdairy.sales.service.integration.SalesInvoicePersistenceService;
import com.smartdairy.sales.validator.SalesInvoiceValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateSalesInvoiceServiceImpl implements UpdateSalesInvoiceService {

    private final SalesInvoiceRepository repository;
    private final CustomerRepository customerRepository;
    private final SalesInvoiceValidator validator;
    private final SalesInvoiceMapper mapper;
    private final SalesInvoiceItemFactory itemFactory;
    private final SalesInventoryService salesInventoryService;
    private final SalesCalculationService salesCalculationService;
    private final SalesInvoicePersistenceService persistenceService;
    private final CustomerLookupService customerLookupService;
    private final CustomerLedgerService customerLedgerService;

    @Override
    public SalesInvoiceResponse update(UUID uuid, UpdateSalesInvoiceRequest request) {

        validator.validateForUpdate(request);

        SalesInvoice invoice = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales Invoice not found."));

        if (Boolean.TRUE.equals(invoice.getLocked())) {

            throw new BusinessException(
                    "Locked Sales Invoice cannot be updated.");

        }

        /*
         * Reverse previous inventory transactions.
         */

        salesInventoryService.reverseInventory(invoice);

        /*
         * Update header.
         */
        invoice.setCustomer(
                customerLookupService.getActiveCustomer(
                        request.customerUuid()));

        invoice.setInvoiceDate(request.invoiceDate());

        invoice.setCustomerName(invoice.getCustomer().getCustomerName());
        invoice.setCustomerMobile(invoice.getCustomer().getMobileNo());

        invoice.setPaymentMode(request.paymentMode());

        invoice.setRemarks(request.remarks());

        /*
         * Remove previous items.
         */
        invoice.getItems().clear();

        BigDecimal totalAmount = BigDecimal.ZERO;

        /*
         * Create new items.
         */
        for (var itemRequest : request.items()) {

            SalesInvoiceItem item = itemFactory.create(invoice, itemRequest);

            invoice.getItems().add(item);

            totalAmount = totalAmount.add(item.getLineTotal());

        }

        BigDecimal discount = request.discountAmount() == null
                        ? BigDecimal.ZERO
                        : request.discountAmount();

        invoice.setTotalAmount(totalAmount);

        invoice.setDiscountAmount(request.discountAmount());

        salesCalculationService.calculate(invoice);

        invoice.setNetAmount(
                totalAmount.subtract(discount));

        SalesInvoice saved = persistenceService.save(invoice);

        customerLedgerService.debit(
                saved.getCustomer(),
                saved.getInvoiceDate(),
                CustomerLedgerReferenceType.SALES,
                saved.getUuid(),
                saved.getInvoiceNo(),
                saved.getNetAmount(),
                "Sales Invoice Updated");

        /*
         * Deduct inventory again.
         */
        salesInventoryService.deductInventory(saved);

        return mapper.toResponse(saved);

    }

}