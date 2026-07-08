package com.smartdairy.settlement.service;

import com.smartdairy.settlement.dto.GenerateSettlementRequest;
import com.smartdairy.settlement.dto.SettlementResponse;

public interface GenerateSettlementService {

    SettlementResponse generate(GenerateSettlementRequest request);

}