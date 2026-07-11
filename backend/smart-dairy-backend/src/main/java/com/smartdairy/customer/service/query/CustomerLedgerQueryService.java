package com.smartdairy.customer.service.query;

import com.smartdairy.customer.dto.CustomerLedgerResponse;

import java.util.List;
import java.util.UUID;

public interface CustomerLedgerQueryService {

    List<CustomerLedgerResponse> getLedger(
            UUID customerUuid);

}