package com.smartdairy.loan.dto;

import com.smartdairy.loan.enums.LoanStatus;
import com.smartdairy.loan.enums.LoanType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LoanResponse(

        UUID uuid,

        String loanNo,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        LoanType loanType,

        LoanStatus status,

        LocalDate loanDate,

        BigDecimal sanctionedAmount,

        BigDecimal interestRate,

        Integer tenureMonths,

        BigDecimal installmentAmount,

        String remarks

) {
}