package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
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
    private final MilkCollectionRepository milkCollectionRepository;
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
        maxLoanRecovery = max(maxLoanRecovery, BigDecimal.ZERO);

        BigDecimal approvedAdvance = advanceRepository.getApprovedAdvanceAmount(settlement.getFarmer().getUuid());
        BigDecimal recoveredAdvance = settlementRepository.getRecoveredAdvanceAmount(settlement.getFarmer().getUuid());
        BigDecimal maxAdvanceRecovery = approvedAdvance
                .subtract(recoveredAdvance.subtract(amountOrZero(settlement.getAdvanceRecovery())));
        maxAdvanceRecovery = max(maxAdvanceRecovery, BigDecimal.ZERO);

        BigDecimal nextBonusAmount = request.bonusAmount() == null
                ? amountOrZero(settlement.getBonusAmount())
                : request.bonusAmount();

        BigDecimal requestedLoanRecovery = request.loanRecovery() == null
                ? amountOrZero(settlement.getLoanRecovery())
                : request.loanRecovery();

        BigDecimal requestedAdvanceRecovery = request.advanceRecovery() == null
                ? amountOrZero(settlement.getAdvanceRecovery())
                : request.advanceRecovery();

        BigDecimal nextOtherDeduction = request.otherDeduction() == null
                ? amountOrZero(settlement.getOtherDeduction())
                : request.otherDeduction();

        BigDecimal nextLoanRecovery = capRecoveryToOutstanding(requestedLoanRecovery, maxLoanRecovery);
        BigDecimal nextAdvanceRecovery = capRecoveryToOutstanding(requestedAdvanceRecovery, maxAdvanceRecovery);

        settlement.setBonusAmount(nextBonusAmount);
        settlement.setLoanRecovery(nextLoanRecovery);
        settlement.setAdvanceRecovery(nextAdvanceRecovery);
        settlement.setOtherDeduction(nextOtherDeduction);
        settlement.setRemarks(request.remarks());

        settlement.setNetPayable(calculateNetPayable(
                amountOrZero(settlement.getMilkAmount()),
                nextBonusAmount,
                nextLoanRecovery,
                nextAdvanceRecovery,
                nextOtherDeduction));

        Settlement saved = settlementRepository.save(settlement);

        BigDecimal calculatedLoanRecovery = milkCollectionRepository.getLoanAmount(
                saved.getFarmer().getUuid(),
                saved.getFromDate(),
                saved.getToDate());

        BigDecimal calculatedAdvanceRecovery = milkCollectionRepository.getAdvanceAmount(
                saved.getFarmer().getUuid(),
                saved.getFromDate(),
                saved.getToDate());

                saved.setOutstandingLoanBefore(maxLoanRecovery);
                saved.setOutstandingAdvanceBefore(maxAdvanceRecovery);
                saved.setCalculatedLoanRecovery(amountOrZero(calculatedLoanRecovery));
                saved.setCalculatedAdvanceRecovery(amountOrZero(calculatedAdvanceRecovery));

                saved = settlementRepository.save(saved);

        return withComputationContext(
                mapper.toResponse(saved),
                maxLoanRecovery,
                maxAdvanceRecovery,
                amountOrZero(calculatedLoanRecovery),
                amountOrZero(calculatedAdvanceRecovery));
    }

        private BigDecimal capRecoveryToOutstanding(BigDecimal recovery, BigDecimal maxAllowed) {

                BigDecimal nonNegativeRecovery = amountOrZero(recovery);

                if (nonNegativeRecovery.compareTo(BigDecimal.ZERO) < 0) {
                        throw new BusinessException("Recovery amount cannot be negative.");
                }

                if (nonNegativeRecovery.compareTo(maxAllowed) > 0) {
                        return maxAllowed;
                }

                return nonNegativeRecovery;
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

    private BigDecimal max(BigDecimal left, BigDecimal right) {
        return left.compareTo(right) >= 0 ? left : right;
    }

    private SettlementResponse withComputationContext(
            SettlementResponse response,
            BigDecimal outstandingLoanBefore,
            BigDecimal outstandingAdvanceBefore,
            BigDecimal calculatedLoanRecovery,
            BigDecimal calculatedAdvanceRecovery) {

        return new SettlementResponse(
                response.uuid(),
                response.settlementNo(),
                response.farmerUuid(),
                response.farmerCode(),
                response.farmerName(),
                response.fromDate(),
                response.toDate(),
                response.milkAmount(),
                response.bonusAmount(),
                response.loanRecovery(),
                response.advanceRecovery(),
                response.otherDeduction(),
                response.netPayable(),
                outstandingLoanBefore,
                outstandingAdvanceBefore,
                calculatedLoanRecovery,
                calculatedAdvanceRecovery,
                response.status(),
                response.remarks());
    }

}