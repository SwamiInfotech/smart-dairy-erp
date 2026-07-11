package com.smartdairy.sales.service.impl;

import com.smartdairy.sales.repository.SalesInvoiceRepository;
import com.smartdairy.sales.service.SalesInvoiceNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SalesInvoiceNumberGeneratorImpl extends SalesInvoiceNumberGenerator {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.BASIC_ISO_DATE;

    private final SalesInvoiceRepository repository;

    @Override
    public String generate(LocalDate invoiceDate) {

        String prefix = "SI" + invoiceDate.format(FORMATTER);

        long sequence = repository.countByInvoiceDate(invoiceDate) + 1;

        return prefix + String.format("%04d", sequence);

    }

}