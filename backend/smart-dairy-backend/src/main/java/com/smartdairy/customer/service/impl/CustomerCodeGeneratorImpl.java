package com.smartdairy.customer.service.impl;

import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.service.CustomerCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerCodeGeneratorImpl
        implements CustomerCodeGenerator {

    private final CustomerRepository repository;

    @Override
    public String generate() {

        long sequence = repository.count() + 1;

        return "CUST" + String.format("%06d", sequence);

    }

}