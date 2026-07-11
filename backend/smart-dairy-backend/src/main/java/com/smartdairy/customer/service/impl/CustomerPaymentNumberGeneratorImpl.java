package com.smartdairy.customer.service.impl;

import com.smartdairy.customer.repository.CustomerPaymentRepository;
import com.smartdairy.customer.service.CustomerPaymentNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerPaymentNumberGeneratorImpl
        implements CustomerPaymentNumberGenerator {

    private final CustomerPaymentRepository repository;

    @Override
    public String generate() {

        long sequence = repository.count() + 1;

        return "CP" + String.format("%06d", sequence);

    }

}