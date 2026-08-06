package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.mapper.SettlementMapper;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.GetSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetSettlementServiceImpl implements GetSettlementService {

    private final SettlementRepository repository;
    private final SettlementMapper mapper;

    @Override
    public SettlementResponse getByUuid(UUID uuid) {

        return repository.findByUuidAndActiveTrue(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found."));
    }

}