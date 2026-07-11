package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.mapper.CustomerMapper;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivateCustomerServiceImpl
        implements ActivateCustomerService {

    private final CustomerRepository repository;

    private final CustomerMapper mapper;

    @Override
    public CustomerResponse activate(UUID uuid) {

        Customer customer = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        if (Boolean.TRUE.equals(customer.getActive())) {

            throw new BusinessException(
                    "Customer is already active.");

        }

        customer.setActive(Boolean.TRUE);

        return mapper.toResponse(repository.save(customer));

    }

}