package com.smartdairy.settlement.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.settlement.dto.GenerateSettlementRequest;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import com.smartdairy.settlement.mapper.SettlementMapper;
import com.smartdairy.settlement.repository.SettlementRepository;
import com.smartdairy.settlement.service.GenerateSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class GenerateSettlementServiceImpl implements GenerateSettlementService {

    private final SettlementRepository settlementRepository;
    private final FarmerRepository farmerRepository;
    private final MilkCollectionRepository milkCollectionRepository;
    private final LoanRepository loanRepository;
    private final AdvanceRepository advanceRepository;
    private final SettlementMapper mapper;

    @Override
    public SettlementResponse generate(GenerateSettlementRequest request) {

        Farmer farmer = farmerRepository.findByUuid(request.farmerUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Farmer not found."));

        BigDecimal milkAmount = getMilkAmount(request);

        BigDecimal calculatedLoanRecovery = getLoanRecoveryFromCollections(request);

        BigDecimal requestedLoanRecovery = resolveRecovery(
                request.loanRecovery(),
                calculatedLoanRecovery);

        BigDecimal calculatedAdvanceRecovery = getAdvanceRecoveryFromCollections(request);

        BigDecimal requestedAdvanceRecovery = resolveRecovery(
                request.advanceRecovery(),
                calculatedAdvanceRecovery);

        BigDecimal outstandingLoan = sanitizeOutstanding(getOutstandingLoan(request));

        BigDecimal outstandingAdvance = sanitizeOutstanding(getOutstandingAdvance(request));

        validateNonNegative(requestedLoanRecovery, "Loan recovery");
        validateNonNegative(requestedAdvanceRecovery, "Advance recovery");

        BigDecimal loanRecovery = capRecoveryToOutstanding(requestedLoanRecovery, outstandingLoan);
        BigDecimal advanceRecovery = capRecoveryToOutstanding(requestedAdvanceRecovery, outstandingAdvance);

        Settlement settlement = mapper.toEntity(request);

        settlement.setSettlementNo(generateSettlementNo());

        settlement.setBranch(farmer.getBranch());

        settlement.setFarmer(farmer);

        settlement.setMilkAmount(milkAmount);

        settlement.setLoanRecovery(loanRecovery);

        settlement.setAdvanceRecovery(advanceRecovery);

        settlement.setOutstandingLoanBefore(outstandingLoan);

        settlement.setOutstandingAdvanceBefore(outstandingAdvance);

        settlement.setCalculatedLoanRecovery(amountOrZero(calculatedLoanRecovery.subtract(loanRecovery)));

        settlement.setCalculatedAdvanceRecovery(amountOrZero(calculatedAdvanceRecovery.subtract(advanceRecovery)));

        settlement.setStatus(SettlementStatus.GENERATED);

        settlement.setNetPayable(calculateNetPayable(
                milkAmount,
                request.bonusAmount(),
            loanRecovery,
            advanceRecovery,
                request.otherDeduction()));

        Settlement saved = settlementRepository.save(settlement);

        return withComputationContext(
                mapper.toResponse(saved),
                outstandingLoan,
                outstandingAdvance,
                calculatedLoanRecovery,
                calculatedAdvanceRecovery);
    }

    private BigDecimal getMilkAmount(GenerateSettlementRequest request) {

        return milkCollectionRepository.getMilkAmount(
                request.farmerUuid(),
                request.fromDate(),
                request.toDate());
    }

    private BigDecimal getOutstandingLoan(
            GenerateSettlementRequest request) {

        BigDecimal approved = loanRepository.getApprovedLoanAmount( request.farmerUuid());

        BigDecimal recovered = settlementRepository.getRecoveredLoanAmount( request.farmerUuid());

        return approved.subtract(recovered);
    }

    private BigDecimal getLoanRecoveryFromCollections(
            GenerateSettlementRequest request) {

        return milkCollectionRepository.getLoanAmount(
                request.farmerUuid(),
                request.fromDate(),
                request.toDate());
    }

    private BigDecimal getOutstandingAdvance(
            GenerateSettlementRequest request) {

        BigDecimal approved = advanceRepository.getApprovedAdvanceAmount(request.farmerUuid());

        BigDecimal recovered = settlementRepository.getRecoveredAdvanceAmount(request.farmerUuid());

        return approved.subtract(recovered);
    }

    private BigDecimal getAdvanceRecoveryFromCollections(
            GenerateSettlementRequest request) {

        return milkCollectionRepository.getAdvanceAmount(
                request.farmerUuid(),
                request.fromDate(),
                request.toDate());
    }

    private void validateNonNegative(BigDecimal amount, String label) {

        if (amount != null && amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(label + " amount cannot be negative.");
        }
    }

    private BigDecimal resolveRecovery(BigDecimal explicitAmount, BigDecimal calculatedAmount) {

        if (explicitAmount != null) {
            return explicitAmount;
        }

        return calculatedAmount == null ? BigDecimal.ZERO : calculatedAmount;
    }

    private BigDecimal sanitizeOutstanding(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }

        return amount;
    }

    private BigDecimal capRecoveryToOutstanding(BigDecimal recovery, BigDecimal outstanding) {

        BigDecimal safeRecovery = amountOrZero(recovery);
        BigDecimal safeOutstanding = sanitizeOutstanding(outstanding);

        if (safeRecovery.compareTo(safeOutstanding) > 0) {
            return safeOutstanding;
        }

        return safeRecovery;
    }

    private BigDecimal amountOrZero(BigDecimal amount) {

        return amount == null ? BigDecimal.ZERO : amount;
    }

    private BigDecimal calculateNetPayable(
            BigDecimal milkAmount,
            BigDecimal bonus,
            BigDecimal loanRecovery,
            BigDecimal advanceRecovery,
            BigDecimal otherDeduction) {

        BigDecimal total = milkAmount;

        if (bonus != null) {
            total = total.add(bonus);
        }

        /*if (loanRecovery != null) {
            total = total.subtract(loanRecovery);
        }*/

        /*if (advanceRecovery != null) {
            total = total.subtract(advanceRecovery);
        }*/

        if (otherDeduction != null) {
            total = total.subtract(otherDeduction);
        }

        return total;
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
                amountOrZero(calculatedLoanRecovery),
                amountOrZero(calculatedAdvanceRecovery),
                response.status(),
                response.remarks());
    }

    private String generateSettlementNo() {

        return "ST"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}