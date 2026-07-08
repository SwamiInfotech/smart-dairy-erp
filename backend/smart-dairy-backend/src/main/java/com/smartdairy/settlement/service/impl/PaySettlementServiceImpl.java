package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import com.smartdairy.settlement.mapper.SettlementMapper;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.PaySettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaySettlementServiceImpl implements PaySettlementService {

    private final SettlementRepository repository;
    private final SettlementMapper mapper;

    @Override
    public SettlementResponse pay(UUID settlementUuid) {

        Settlement settlement = repository.findByUuid(settlementUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Settlement not found."));

        if (settlement.getStatus() == SettlementStatus.PAID) {
            throw new BusinessException("Settlement is already paid.");
        }

        settlement.setStatus(SettlementStatus.PAID);

        return mapper.toResponse(repository.save(settlement));
    }
}