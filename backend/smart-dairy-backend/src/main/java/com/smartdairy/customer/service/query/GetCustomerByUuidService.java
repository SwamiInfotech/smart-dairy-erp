package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerResponse;

import java.util.UUID;

public interface GetCustomerByUuidService {

    CustomerResponse get(UUID uuid);

}