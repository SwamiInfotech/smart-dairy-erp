package com.smartdairy.customer.service.integration;

import com.smartdairy.customer.entity.Customer;

import java.util.UUID;

public interface CustomerLookupService {

    Customer getActiveCustomer(UUID customerUuid);

}