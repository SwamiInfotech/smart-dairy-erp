package com.smartdairy.sales.service.command;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
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
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final SalesInvoiceValidator validator;
    private final SalesInvoiceMapper mapper;
    private final SalesInvoiceNumberGenerator invoiceNumberGenerator;
    private final SalesInvoiceItemFactory itemFactory;
    private final SalesCalculationService salesCalculationService;
    private final SalesInventoryService salesInventoryService;
    private final SalesInvoicePersistenceService persistenceService;

    @Override
    public SalesInvoiceResponse create(CreateSalesInvoiceRequest request) {

        validator.validate(request);

        Branch branch = branchRepository
                .findByUuid(request.branchUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Branch not found."));

        SalesInvoice invoice = new SalesInvoice();

        invoice.setBranch(branch);

        invoice.setInvoiceNo(invoiceNumberGenerator.generate(request.invoiceDate()));

        invoice.setInvoiceDate(request.invoiceDate());

        invoice.setCustomerName(request.customerName());

        invoice.setCustomerMobile(request.customerMobile());

        invoice.setPaymentMode(request.paymentMode());

        invoice.setRemarks(request.remarks());

        invoice.setStatus(SalesStatus.COMPLETED);

        for (var itemRequest : request.items()) {

            invoice.getItems().add(
                    itemFactory.create(invoice, itemRequest));

        }

        invoice.setDiscountAmount(
                request.discountAmount());

        salesCalculationService.calculate(invoice);

        //SalesInvoice saved = salesInvoiceRepository.save(invoice);
        SalesInvoice saved = persistenceService.save(invoice);

        salesInventoryService.deductInventory(saved);

        return mapper.toResponse(saved);

    }

}