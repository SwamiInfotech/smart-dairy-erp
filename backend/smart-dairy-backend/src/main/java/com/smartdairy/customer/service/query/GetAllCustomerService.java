package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.dto.CustomerSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GetAllCustomerService {

    Page<CustomerResponse> search(
            CustomerSearchRequest request,
            Pageable pageable);

}