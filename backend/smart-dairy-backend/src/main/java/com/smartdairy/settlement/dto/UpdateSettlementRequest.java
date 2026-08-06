package com.smartdairy.settlement.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

public record UpdateSettlementRequest(

        @DecimalMin("0.00")
        BigDecimal bonusAmount,

        @DecimalMin("0.00")
        BigDecimal loanRecovery,

        @DecimalMin("0.00")
        BigDecimal advanceRecovery,

        @DecimalMin("0.00")
        BigDecimal otherDeduction,

        String remarks
) {
}