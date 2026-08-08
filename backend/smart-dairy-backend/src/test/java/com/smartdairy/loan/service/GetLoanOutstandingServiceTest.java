package com.smartdairy.loan.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmer.repository.FarmerRepository;
import com.smartdairy.loan.dto.LoanOutstandingResponse;
import com.smartdairy.loan.repository.AdvanceRepository;
import com.smartdairy.loan.repository.LoanRepository;
import com.smartdairy.settlement.repository.SettlementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetLoanOutstandingServiceTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private AdvanceRepository advanceRepository;

    @Mock
    private SettlementRepository settlementRepository;

    @InjectMocks
    private GetLoanOutstandingService service;

    @Test
    void getByFarmerUuid_returnsOutstandingSummary() {
        UUID farmerUuid = UUID.randomUUID();
        Farmer farmer = new Farmer();

        when(farmerRepository.findByUuidAndActiveTrue(farmerUuid))
                .thenReturn(Optional.of(farmer));
        when(loanRepository.getApprovedLoanAmount(farmerUuid))
                .thenReturn(new BigDecimal("1000.00"));
        when(settlementRepository.getRecoveredLoanAmount(farmerUuid))
                .thenReturn(new BigDecimal("250.00"));
        when(advanceRepository.getApprovedAdvanceAmount(farmerUuid))
                .thenReturn(new BigDecimal("500.00"));
        when(settlementRepository.getRecoveredAdvanceAmount(farmerUuid))
                .thenReturn(new BigDecimal("120.00"));

        LoanOutstandingResponse response = service.getByFarmerUuid(farmerUuid);

        assertEquals(new BigDecimal("1000.00"), response.approvedLoanAmount());
        assertEquals(new BigDecimal("250.00"), response.recoveredLoanAmount());
        assertEquals(new BigDecimal("750.00"), response.outstandingLoanAmount());
        assertEquals(new BigDecimal("500.00"), response.approvedAdvanceAmount());
        assertEquals(new BigDecimal("120.00"), response.recoveredAdvanceAmount());
        assertEquals(new BigDecimal("380.00"), response.outstandingAdvanceAmount());
    }

    @Test
    void getByFarmerUuid_clampsNegativeOutstandingToZero() {
        UUID farmerUuid = UUID.randomUUID();
        Farmer farmer = new Farmer();

        when(farmerRepository.findByUuidAndActiveTrue(farmerUuid))
                .thenReturn(Optional.of(farmer));
        when(loanRepository.getApprovedLoanAmount(farmerUuid))
                .thenReturn(new BigDecimal("100.00"));
        when(settlementRepository.getRecoveredLoanAmount(farmerUuid))
                .thenReturn(new BigDecimal("120.00"));
        when(advanceRepository.getApprovedAdvanceAmount(farmerUuid))
                .thenReturn(new BigDecimal("20.00"));
        when(settlementRepository.getRecoveredAdvanceAmount(farmerUuid))
                .thenReturn(new BigDecimal("50.00"));

        LoanOutstandingResponse response = service.getByFarmerUuid(farmerUuid);

        assertEquals(BigDecimal.ZERO, response.outstandingLoanAmount());
        assertEquals(BigDecimal.ZERO, response.outstandingAdvanceAmount());
    }

    @Test
    void getByFarmerUuid_throwsWhenFarmerNotFound() {
        UUID farmerUuid = UUID.randomUUID();

        when(farmerRepository.findByUuidAndActiveTrue(farmerUuid))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getByFarmerUuid(farmerUuid));
    }
}
