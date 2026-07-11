package com.smartdairy.sales.service.command;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.enums.CustomerLedgerReferenceType;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.service.CustomerLedgerService;
import com.smartdairy.customer.service.integration.CustomerLookupService;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.sales.dto.CreateSalesInvoiceRequest;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import com.smartdairy.sales.enums.SalesStatus;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import com.smartdairy.sales.service.SalesCalculationService;
import com.smartdairy.sales.service.SalesInvoiceNumberGenerator;
import com.smartdairy.sales.service.integration.SalesInventoryService;
import com.smartdairy.sales.service.integration.SalesInvoicePersistenceService;
import com.smartdairy.sales.validator.SalesInvoiceValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateSalesInvoiceServiceImpl implements CreateSalesInvoiceService {

    private final BranchRepository branchRepository;
    private final CustomerRepository customerRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesInvoiceValidator validator;
    private final SalesInvoiceMapper mapper;
    private final SalesInvoiceNumberGenerator invoiceNumberGenerator;
    private final SalesInvoiceItemFactory itemFactory;
    private final SalesCalculationService salesCalculationService;
    private final SalesInventoryService salesInventoryService;
    private final SalesInvoicePersistenceService persistenceService;
    private final CustomerLedgerService customerLedgerService;
    private final CustomerLookupService customerLookupService;

    @Override
    public SalesInvoiceResponse create(CreateSalesInvoiceRequest request) {

        validator.validate(request);

        Branch branch = branchRepository
                .findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Branch not found."));

        Customer customer = customerRepository
                .findByUuid(request.customerUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        SalesInvoice invoice = new SalesInvoice();

        invoice.setBranch(branch);
        //invoice.setCustomer(customer);

        invoice.setCustomer(customerLookupService.getActiveCustomer(request.customerUuid()));

        invoice.setCustomerName(customer.getCustomerName());
        invoice.setCustomerMobile(customer.getMobileNo());

        invoice.setInvoiceNo(invoiceNumberGenerator.generate(request.invoiceDate()));

        invoice.setInvoiceDate(request.invoiceDate());

        invoice.setPaymentMode(request.paymentMode());

        invoice.setRemarks(request.remarks());

        invoice.setStatus(SalesStatus.COMPLETED);

        for (var itemRequest : request.items()) {
            invoice.getItems().add(itemFactory.create(invoice, itemRequest));
        }

        invoice.setDiscountAmount(
                request.discountAmount());

        salesCalculationService.calculate(invoice);

        //SalesInvoice saved = salesInvoiceRepository.save(invoice);
        SalesInvoice saved = persistenceService.save(invoice);

        customerLedgerService.debit(
                saved.getCustomer(),
                saved.getInvoiceDate(),
                CustomerLedgerReferenceType.SALES,
                saved.getUuid(),
                saved.getInvoiceNo(),
                saved.getNetAmount(),
                "Sales Invoice");

        salesInventoryService.deductInventory(saved);

        return mapper.toResponse(saved);

    }

}