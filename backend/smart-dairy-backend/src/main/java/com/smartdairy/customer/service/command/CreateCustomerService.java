package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CreateCustomerRequest;
import com.smartdairy.customer.dto.CustomerResponse;

public interface CreateCustomerService {

    CustomerResponse create(CreateCustomerRequest request);

}