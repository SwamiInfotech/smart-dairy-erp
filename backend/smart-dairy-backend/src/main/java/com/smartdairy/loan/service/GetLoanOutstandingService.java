package com.smartdairy.loan.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.loan.dto.LoanOutstandingResponse;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.settlement.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetLoanOutstandingService {

    private final FarmerRepository farmerRepository;
    private final LoanRepository loanRepository;
    private final AdvanceRepository advanceRepository;
    private final SettlementRepository settlementRepository;

    public LoanOutstandingResponse getByFarmerUuid(UUID farmerUuid) {

        farmerRepository.findByUuidAndActiveTrue(farmerUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found."));

        BigDecimal approvedLoan = amountOrZero(loanRepository.getApprovedLoanAmount(farmerUuid));
        BigDecimal recoveredLoan = amountOrZero(settlementRepository.getRecoveredLoanAmount(farmerUuid));
        BigDecimal outstandingLoan = max(approvedLoan.subtract(recoveredLoan), BigDecimal.ZERO);

        BigDecimal approvedAdvance = amountOrZero(advanceRepository.getApprovedAdvanceAmount(farmerUuid));
        BigDecimal recoveredAdvance = amountOrZero(settlementRepository.getRecoveredAdvanceAmount(farmerUuid));
        BigDecimal outstandingAdvance = max(approvedAdvance.subtract(recoveredAdvance), BigDecimal.ZERO);

        return new LoanOutstandingResponse(
                farmerUuid,
                approvedLoan,
                recoveredLoan,
                outstandingLoan,
                approvedAdvance,
                recoveredAdvance,
                outstandingAdvance);
    }

    private BigDecimal amountOrZero(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private BigDecimal max(BigDecimal left, BigDecimal right) {
        return left.compareTo(right) >= 0 ? left : right;
    }
}
