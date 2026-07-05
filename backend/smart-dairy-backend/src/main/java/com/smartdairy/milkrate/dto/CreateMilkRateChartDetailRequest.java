package com.smartdairy.milkrate.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateMilkRateChartDetailRequest(

        BigDecimal fat,

        BigDecimal snf,

        BigDecimal mava,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal rate

) {
}