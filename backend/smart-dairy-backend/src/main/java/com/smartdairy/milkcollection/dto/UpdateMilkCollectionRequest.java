package com.smartdairy.milkcollection.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record UpdateMilkCollectionRequest(

        @NotNull
        UUID shiftUuid,

        @NotNull
        LocalDate collectionDate,

        @NotNull
        LocalTime collectionTime,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal quantity,

        BigDecimal fat,

        BigDecimal snf,

        BigDecimal mava,

        String remarks
) {
}