package com.smartdairy.milkrate.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MilkRateChartDetailResponse(

        UUID uuid,

        BigDecimal fat,

        BigDecimal snf,

        BigDecimal mava,

        BigDecimal rate

) {
}