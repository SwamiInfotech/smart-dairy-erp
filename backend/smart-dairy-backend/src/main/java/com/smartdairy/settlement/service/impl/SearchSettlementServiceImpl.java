package com.smartdairy.settlement.service.impl;

import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.dto.SettlementSearchRequest;
import com.smartdairy.settlement.mapper.SettlementMapper;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.SearchSettlementService;
import com.smartdairy.settlement.specification.SettlementSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchSettlementServiceImpl implements SearchSettlementService {

    private final SettlementRepository repository;
    private final SettlementMapper mapper;

    @Override
    public Page<SettlementResponse> search(
            SettlementSearchRequest request,
            Pageable pageable) {

        return repository.findAll(SettlementSpecification.search(request), pageable)
                .map(mapper::toResponse);
    }

}