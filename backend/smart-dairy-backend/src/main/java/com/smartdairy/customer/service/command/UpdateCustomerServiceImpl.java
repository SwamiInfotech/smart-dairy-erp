package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.dto.UpdateCustomerRequest;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.mapper.CustomerMapper;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.customer.validator.CustomerValidator;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateCustomerServiceImpl
        implements UpdateCustomerService {

    private final CustomerRepository repository;

    private final CustomerValidator validator;

    private final CustomerMapper mapper;

    @Override
    public CustomerResponse update(
            UUID uuid,
            UpdateCustomerRequest request) {

        validator.validateForUpdate(request);

        Customer customer = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found."));

        if (!customer.getMobileNo().equals(request.mobileNo())
                && repository.existsByMobileNo(request.mobileNo())) {

            throw new BusinessException(
                    "Mobile number already exists.");

        }

        customer.setCustomerName(request.customerName());

        customer.setMobileNo(request.mobileNo());

        customer.setAlternateMobileNo(
                request.alternateMobileNo());

        customer.setEmail(request.email());

        customer.setAddress(request.address());

        customer.setCity(request.city());

        customer.setState(request.state());

        customer.setPincode(request.pincode());

        customer.setGstNo(request.gstNo());

        customer.setCreditLimit(request.creditLimit());

        Customer updated = repository.save(customer);

        return mapper.toResponse(updated);

    }

}