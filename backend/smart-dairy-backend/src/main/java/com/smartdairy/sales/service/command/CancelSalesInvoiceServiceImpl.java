package com.smartdairy.sales.service.command;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.enums.SalesStatus;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import com.smartdairy.sales.service.integration.SalesInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CancelSalesInvoiceServiceImpl
        implements CancelSalesInvoiceService {

    private final SalesInvoiceRepository repository;

    private final SalesInventoryService salesInventoryService;

    private final SalesInvoiceMapper mapper;

    @Override
    public SalesInvoiceResponse cancel(UUID uuid) {

        SalesInvoice invoice = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales Invoice not found."));

        if (invoice.getStatus() == SalesStatus.CANCELLED) {

            throw new BusinessException(
                    "Sales Invoice is already cancelled.");

        }

        /*
         * Restore Inventory
         */
        salesInventoryService.reverseInventory(invoice);

        /*
         * Mark Invoice Cancelled
         */
        invoice.setStatus(SalesStatus.CANCELLED);

        SalesInvoice saved = repository.save(invoice);

        return mapper.toResponse(saved);

    }

}