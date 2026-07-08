package com.smartdairy.loan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateAdvanceRequest(

        @NotNull
        UUID farmerUuid,

        @NotNull
        LocalDate advanceDate,

        @NotNull
        @DecimalMin("1")
        BigDecimal advanceAmount,

        String remarks

) {
}