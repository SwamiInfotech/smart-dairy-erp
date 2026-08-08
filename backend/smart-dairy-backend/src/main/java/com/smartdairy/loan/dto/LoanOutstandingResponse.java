package com.smartdairy.loan.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LoanOutstandingResponse(

        UUID farmerUuid,

        BigDecimal approvedLoanAmount,

        BigDecimal recoveredLoanAmount,

        BigDecimal outstandingLoanAmount,

        BigDecimal approvedAdvanceAmount,

        BigDecimal recoveredAdvanceAmount,

        BigDecimal outstandingAdvanceAmount

) {
}
