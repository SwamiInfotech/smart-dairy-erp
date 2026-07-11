package com.smartdairy.sales.service.query;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetSalesInvoiceByNumberServiceImpl
        implements GetSalesInvoiceByNumberService {

    private final SalesInvoiceRepository repository;

    private final SalesInvoiceMapper mapper;

    @Override
    public SalesInvoiceResponse get(String invoiceNo) {

        SalesInvoice invoice = repository.findByInvoiceNo(invoiceNo)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales Invoice not found : " + invoiceNo));

        return mapper.toResponse(invoice);

    }

}