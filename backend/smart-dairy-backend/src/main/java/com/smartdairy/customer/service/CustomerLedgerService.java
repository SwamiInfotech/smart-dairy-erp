package com.smartdairy.customer.service;

import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.enums.CustomerLedgerReferenceType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface CustomerLedgerService {

    void debit(
            Customer customer,
            LocalDate transactionDate,
            CustomerLedgerReferenceType referenceType,
            UUID referenceUuid,
            String referenceNumber,
            BigDecimal amount,
            String remarks);

    void credit(
            Customer customer,
            LocalDate transactionDate,
            CustomerLedgerReferenceType referenceType,
            UUID referenceUuid,
            String referenceNumber,
            BigDecimal amount,
            String remarks);

}