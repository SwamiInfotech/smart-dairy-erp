package com.smartdairy.sales.service.integration;

import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SalesInvoicePersistenceService {

    private final SalesInvoiceRepository repository;

    public SalesInvoice save(SalesInvoice invoice) {

        return repository.save(invoice);

    }

}