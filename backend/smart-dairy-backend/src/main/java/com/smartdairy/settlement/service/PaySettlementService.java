package com.smartdairy.settlement.service;

import com.smartdairy.settlement.dto.SettlementResponse;

import java.util.UUID;

public interface PaySettlementService {
    SettlementResponse pay(UUID settlementUuid);
}