package com.smartdairy.customer.service.impl;

import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.entity.CustomerLedger;
import com.smartdairy.customer.enums.CustomerLedgerReferenceType;
import com.smartdairy.customer.repository.CustomerLedgerRepository;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.service.CustomerLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerLedgerServiceImpl
        implements CustomerLedgerService {

    private final CustomerLedgerRepository ledgerRepository;

    private final CustomerRepository customerRepository;

    @Override
    public void debit(
            Customer customer,
            LocalDate transactionDate,
            CustomerLedgerReferenceType referenceType,
            UUID referenceUuid,
            String referenceNumber,
            BigDecimal amount,
            String remarks) {

        CustomerLedger ledger = new CustomerLedger();

        ledger.setCustomer(customer);
        ledger.setTransactionDate(transactionDate);
        ledger.setReferenceType(referenceType.name());
        ledger.setReferenceUuid(referenceUuid);
        ledger.setReferenceNumber(referenceNumber);
        ledger.setDebitAmount(amount);
        ledger.setCreditAmount(BigDecimal.ZERO);

        BigDecimal balance = customer.getCurrentBalance().add(amount);

        ledger.setBalance(balance);
        ledger.setRemarks(remarks);

        customer.setCurrentBalance(balance);

        ledgerRepository.save(ledger);

        customerRepository.save(customer);

    }

    @Override
    public void credit(
            Customer customer,
            LocalDate transactionDate,
            CustomerLedgerReferenceType referenceType,
            UUID referenceUuid,
            String referenceNumber,
            BigDecimal amount,
            String remarks) {

        CustomerLedger ledger = new CustomerLedger();

        ledger.setCustomer(customer);
        ledger.setTransactionDate(transactionDate);
        ledger.setReferenceType(referenceType.name());
        ledger.setReferenceUuid(referenceUuid);
        ledger.setReferenceNumber(referenceNumber);
        ledger.setDebitAmount(BigDecimal.ZERO);
        ledger.setCreditAmount(amount);

        BigDecimal balance = customer.getCurrentBalance().subtract(amount);

        ledger.setBalance(balance);
        ledger.setRemarks(remarks);

        customer.setCurrentBalance(balance);

        ledgerRepository.save(ledger);

        customerRepository.save(customer);

    }

}