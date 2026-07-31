package com.smartdairy.milkrate.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MilkRateChartDetailResponse(

        UUID uuid,

        BigDecimal fatFrom,

        BigDecimal fatTo,

        BigDecimal snfFrom,

        BigDecimal snfTo,

        BigDecimal mavaFrom,

        BigDecimal mavaTo,

        BigDecimal rate

) {
}