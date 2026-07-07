package com.smartdairy.milkcollection.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyMilkCollectionSummaryResponse(

        LocalDate collectionDate,

        Long totalCollections,

        BigDecimal totalQuantity,

        BigDecimal totalAmount,

        Double averageFat,

        Double averageSnf,

        Double averageMava

) {
}