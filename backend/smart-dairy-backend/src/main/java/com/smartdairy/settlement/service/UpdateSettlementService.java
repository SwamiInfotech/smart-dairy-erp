package com.smartdairy.settlement.service;

import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.dto.UpdateSettlementRequest;

import java.util.UUID;

public interface UpdateSettlementService {

    SettlementResponse update(
            UUID settlementUuid,
            UpdateSettlementRequest request);

}