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

        BigDecimal outstandingLoan = getOutstandingLoan(request);

        BigDecimal outstandingAdvance = getOutstandingAdvance(request);

        validateRecovery(request.loanRecovery(), outstandingLoan, "Loan");

        validateRecovery(request.advanceRecovery(), outstandingAdvance, "Advance");

        Settlement settlement = mapper.toEntity(request);

        settlement.setSettlementNo(generateSettlementNo());

        settlement.setBranch(farmer.getBranch());

        settlement.setFarmer(farmer);

        settlement.setMilkAmount(milkAmount);

        settlement.setStatus(SettlementStatus.GENERATED);

        settlement.setNetPayable(calculateNetPayable(
                milkAmount,
                request.bonusAmount(),
                request.loanRecovery(),
                request.advanceRecovery(),
                request.otherDeduction()));

        Settlement saved = settlementRepository.save(settlement);

        return mapper.toResponse(saved);
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

    private BigDecimal getOutstandingAdvance(
            GenerateSettlementRequest request) {

        BigDecimal approved = advanceRepository.getApprovedAdvanceAmount(request.farmerUuid());

        BigDecimal recovered = settlementRepository.getRecoveredAdvanceAmount(request.farmerUuid());

        return approved.subtract(recovered);
    }

    private void validateRecovery(
            BigDecimal recovery,
            BigDecimal outstanding,
            String type) {

        if (recovery == null) {
            return;
        }

        if (recovery.compareTo(outstanding) > 0) {
            throw new BusinessException(
                    type + " recovery amount cannot exceed outstanding amount.");
        }
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

        if (loanRecovery != null) {
            total = total.subtract(loanRecovery);
        }

        if (advanceRecovery != null) {
            total = total.subtract(advanceRecovery);
        }

        if (otherDeduction != null) {
            total = total.subtract(otherDeduction);
        }

        return total;
    }

    private String generateSettlementNo() {

        return "ST"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}