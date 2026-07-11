package com.smartdairy.customer.service.command;

import com.smartdairy.customer.dto.CustomerResponse;

import java.util.UUID;

public interface DeactivateCustomerService {

    CustomerResponse deactivate(UUID uuid);

}