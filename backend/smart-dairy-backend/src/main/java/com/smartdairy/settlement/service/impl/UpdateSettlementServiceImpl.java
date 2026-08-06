package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.dto.UpdateSettlementRequest;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import com.smartdairy.settlement.mapper.SettlementMapper;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.UpdateSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateSettlementServiceImpl implements UpdateSettlementService {

    private final SettlementRepository settlementRepository;
    private final LoanRepository loanRepository;
    private final AdvanceRepository advanceRepository;
    private final SettlementMapper mapper;

    @Override
    public SettlementResponse update(
            UUID settlementUuid,
            UpdateSettlementRequest request) {

        Settlement settlement = settlementRepository.findByUuidAndActiveTrue(settlementUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found."));

        if (settlement.getStatus() == SettlementStatus.PAID) {
            throw new BusinessException("Paid settlement cannot be updated.");
        }

        BigDecimal approvedLoan = loanRepository.getApprovedLoanAmount(settlement.getFarmer().getUuid());
        BigDecimal recoveredLoan = settlementRepository.getRecoveredLoanAmount(settlement.getFarmer().getUuid());
        BigDecimal maxLoanRecovery = approvedLoan
                .subtract(recoveredLoan.subtract(amountOrZero(settlement.getLoanRecovery())));

        BigDecimal approvedAdvance = advanceRepository.getApprovedAdvanceAmount(settlement.getFarmer().getUuid());
        BigDecimal recoveredAdvance = settlementRepository.getRecoveredAdvanceAmount(settlement.getFarmer().getUuid());
        BigDecimal maxAdvanceRecovery = approvedAdvance
                .subtract(recoveredAdvance.subtract(amountOrZero(settlement.getAdvanceRecovery())));

        validateRecovery(request.loanRecovery(), maxLoanRecovery, "Loan");
        validateRecovery(request.advanceRecovery(), maxAdvanceRecovery, "Advance");

        mapper.updateEntity(request, settlement);
        settlement.setNetPayable(calculateNetPayable(
                amountOrZero(settlement.getMilkAmount()),
                amountOrZero(request.bonusAmount()),
                amountOrZero(request.loanRecovery()),
                amountOrZero(request.advanceRecovery()),
                amountOrZero(request.otherDeduction())));

        return mapper.toResponse(settlementRepository.save(settlement));
    }

    private void validateRecovery(BigDecimal recovery, BigDecimal maxAllowed, String label) {

        if (recovery == null) {
            return;
        }

        if (recovery.compareTo(maxAllowed) > 0) {
            throw new BusinessException(
                    label + " recovery amount cannot exceed outstanding amount.");
        }
    }

    private BigDecimal calculateNetPayable(
            BigDecimal milkAmount,
            BigDecimal bonus,
            BigDecimal loanRecovery,
            BigDecimal advanceRecovery,
            BigDecimal otherDeduction) {

        return milkAmount
                .add(bonus)
                .subtract(loanRecovery)
                .subtract(advanceRecovery)
                .subtract(otherDeduction);
    }

    private BigDecimal amountOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

}