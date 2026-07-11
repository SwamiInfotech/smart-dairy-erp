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
public class DeactivateCustomerServiceImpl
        implements DeactivateCustomerService {

    private final CustomerRepository repository;

    private final CustomerMapper mapper;

    @Override
    public CustomerResponse deactivate(UUID uuid) {

        Customer customer = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        if (Boolean.FALSE.equals(customer.getActive())) {

            throw new BusinessException(
                    "Customer is already inactive.");

        }

        customer.setActive(Boolean.FALSE);

        return mapper.toResponse(repository.save(customer));

    }

}