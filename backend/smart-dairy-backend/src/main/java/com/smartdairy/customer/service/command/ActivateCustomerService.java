package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CustomerResponse;

import java.util.UUID;

public interface ActivateCustomerService {

    CustomerResponse activate(UUID uuid);

}