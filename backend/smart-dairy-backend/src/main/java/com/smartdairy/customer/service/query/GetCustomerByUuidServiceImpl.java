package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.mapper.CustomerMapper;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCustomerByUuidServiceImpl
        implements GetCustomerByUuidService {

    private final CustomerRepository repository;

    private final CustomerMapper mapper;

    @Override
    public CustomerResponse get(UUID uuid) {

        Customer customer = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        return mapper.toResponse(customer);

    }

}