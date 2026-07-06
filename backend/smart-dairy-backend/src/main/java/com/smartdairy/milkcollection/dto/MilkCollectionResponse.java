package com.smartdairy.milkcollection.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MilkCollectionResponse(

        UUID uuid,

        String collectionNo,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        UUID shiftUuid,

        String shift,

        UUID milkTypeUuid,

        String milkType,

        LocalDate collectionDate,

        LocalTime collectionTime,

        BigDecimal quantity,

        BigDecimal fat,

        BigDecimal snf,

        BigDecimal mava,

        BigDecimal calculatedRate,

        BigDecimal grossAmount

) {
}