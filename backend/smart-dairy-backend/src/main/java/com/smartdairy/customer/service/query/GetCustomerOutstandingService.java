package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerOutstandingResponse;

import java.util.List;

public interface GetCustomerOutstandingService {

    List<CustomerOutstandingResponse> getOutstanding();

}