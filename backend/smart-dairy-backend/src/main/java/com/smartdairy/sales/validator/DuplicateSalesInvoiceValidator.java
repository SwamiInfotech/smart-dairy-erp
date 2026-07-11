package com.smartdairy.sales.validator;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DuplicateSalesInvoiceValidator {

    private final SalesInvoiceRepository repository;

    public void validate(String invoiceNo) {

        if (repository.existsByInvoiceNo(invoiceNo)) {

            throw new BusinessException(
                    "Sales Invoice already exists : " + invoiceNo);

        }

    }

}