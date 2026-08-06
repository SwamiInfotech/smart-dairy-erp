package com.smartdairy.settlement.service;

import com.smartdairy.settlement.dto.SettlementResponse;

import java.util.UUID;

public interface GetSettlementService {

    SettlementResponse getByUuid(UUID uuid);

}