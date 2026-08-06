package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.payment.repository.PaymentRepository;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.DeleteSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteSettlementServiceImpl implements DeleteSettlementService {

    private final SettlementRepository settlementRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public void delete(UUID settlementUuid) {

        Settlement settlement = settlementRepository.findByUuidAndActiveTrue(settlementUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found."));

        if (settlement.getStatus() == SettlementStatus.PAID) {
            throw new BusinessException("Paid settlement cannot be deleted.");
        }

        if (paymentRepository.existsBySettlementUuid(settlementUuid)) {
            throw new BusinessException("Settlement with payment record cannot be deleted.");
        }

        settlement.setActive(false);
        settlementRepository.save(settlement);
    }

}