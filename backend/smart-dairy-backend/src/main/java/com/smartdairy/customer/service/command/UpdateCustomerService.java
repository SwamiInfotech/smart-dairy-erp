package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.dto.UpdateCustomerRequest;

import java.util.UUID;

public interface UpdateCustomerService {

    CustomerResponse update(
            UUID uuid,
            UpdateCustomerRequest request);

}