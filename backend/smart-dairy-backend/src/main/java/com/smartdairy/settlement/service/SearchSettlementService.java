package com.smartdairy.settlement.service;

import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.dto.SettlementSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchSettlementService {

    Page<SettlementResponse> search(
            SettlementSearchRequest request,
            Pageable pageable);

}