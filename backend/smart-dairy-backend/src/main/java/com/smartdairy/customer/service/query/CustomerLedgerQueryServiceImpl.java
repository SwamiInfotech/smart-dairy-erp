package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerLedgerResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.mapper.CustomerLedgerMapper;
import com.smartdairy.customer.repository.CustomerLedgerRepository;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerLedgerQueryServiceImpl
        implements CustomerLedgerQueryService {

    private final CustomerRepository customerRepository;

    private final CustomerLedgerRepository ledgerRepository;

    private final CustomerLedgerMapper mapper;

    @Override
    public List<CustomerLedgerResponse> getLedger(
            UUID customerUuid) {

        Customer customer = customerRepository.findByUuid(customerUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        return ledgerRepository
                .findByCustomerOrderByTransactionDateAscIdAsc(customer)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

}