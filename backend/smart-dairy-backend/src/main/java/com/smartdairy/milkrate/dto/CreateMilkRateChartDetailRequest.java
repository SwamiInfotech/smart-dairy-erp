package com.smartdairy.milkrate.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateMilkRateChartDetailRequest(

        BigDecimal fatFrom,

        BigDecimal fatTo,

        BigDecimal snfFrom,

        BigDecimal snfTo,

        BigDecimal mavaFrom,

        BigDecimal mavaTo,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal rate

) {
}