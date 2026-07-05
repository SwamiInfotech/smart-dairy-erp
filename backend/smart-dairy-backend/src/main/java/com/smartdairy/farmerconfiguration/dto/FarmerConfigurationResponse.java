package com.smartdairy.farmerconfiguration.dto;

import java.time.LocalDate;
import java.util.UUID;

public record FarmerConfigurationResponse(

        UUID uuid,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        UUID milkTypeUuid,

        String milkType,

        UUID collectionMethodUuid,

        String collectionMethod,

        UUID paymentCycleUuid,

        String paymentCycle,

        UUID rateCategoryUuid,

        String rateCategory,

        LocalDate effectiveFrom,

        LocalDate effectiveTo,

        Boolean active

) {
}