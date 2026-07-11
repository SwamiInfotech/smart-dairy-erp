package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerStatementResponse;

import java.util.List;
import java.util.UUID;

public interface GetCustomerStatementService {

    List<CustomerStatementResponse> getStatement(UUID customerUuid);

}