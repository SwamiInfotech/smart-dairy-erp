package com.smartdairy.settlement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GenerateSettlementRequest(

        @NotNull
        UUID farmerUuid,

        @NotNull
        LocalDate fromDate,

        @NotNull
        LocalDate toDate,

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