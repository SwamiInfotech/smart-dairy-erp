package com.smartdairy.loan.dto;

import com.smartdairy.loan.enums.LoanType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateLoanRequest(

        @NotNull
        LoanType loanType,

        @NotNull
        LocalDate loanDate,

        @NotNull
        @DecimalMin("1")
        BigDecimal sanctionedAmount,

        BigDecimal interestRate,

        Integer tenureMonths,

        BigDecimal installmentAmount,

        String remarks
) {
}