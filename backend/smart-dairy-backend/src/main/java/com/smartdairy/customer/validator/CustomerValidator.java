package com.smartdairy.customer.validator;

import com.smartdairy.customer.dto.CreateCustomerRequest;
import com.smartdairy.customer.dto.UpdateCustomerRequest;
import com.smartdairy.customer.repository.CustomerRepository;
import com.smartdairy.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomerValidator {

    private final CustomerRepository repository;

    public void validate(CreateCustomerRequest request) {

        if (repository.existsByMobileNo(request.mobileNo())) {

            throw new BusinessException(
                    "Customer already exists with mobile number : "
                            + request.mobileNo());

        }

    }

    public void validateForUpdate(UpdateCustomerRequest request) {

        if (request.customerName().isBlank()) {

            throw new BusinessException(
                    "Customer Name is mandatory.");

        }

        if (request.mobileNo().isBlank()) {

            throw new BusinessException(
                    "Mobile Number is mandatory.");

        }

    }

}