package com.smartdairy.customer.service.integration;

import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerLookupServiceImpl
        implements CustomerLookupService {

    private final CustomerRepository customerRepository;

    @Override
    public Customer getActiveCustomer(UUID customerUuid) {

        Customer customer = customerRepository.findByUuid(customerUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        if (Boolean.FALSE.equals(customer.getActive())) {

            throw new BusinessException(
                    "Customer is inactive.");

        }

        return customer;

    }

}