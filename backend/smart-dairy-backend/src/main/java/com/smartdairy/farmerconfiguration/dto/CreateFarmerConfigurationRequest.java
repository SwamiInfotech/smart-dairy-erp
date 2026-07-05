package com.smartdairy.farmerconfiguration.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateFarmerConfigurationRequest(

        @NotNull
        UUID farmerUuid,

        @NotNull
        UUID milkTypeUuid,

        @NotNull
        UUID collectionMethodUuid,

        @NotNull
        UUID paymentCycleUuid,

        @NotNull
        UUID rateCategoryUuid,

        @NotNull
        LocalDate effectiveFrom

) {
}