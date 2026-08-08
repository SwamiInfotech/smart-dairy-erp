package com.smartdairy.farmer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateFarmerRequest(

        @NotNull
        UUID branchUuid,

        @NotBlank
        String farmerCode,

        @NotBlank
        String farmerName,

        String mobileNo,

        String alternateMobileNo,

        String email,

        String address,

        @NotBlank
        String village,

        String taluka,

        String district,

        String state,

        String pincode,

        String aadharNo,

        String panNo,

        String photoUrl,

        String remarks,

        // Farmer Configuration fields (flat payload support)
        UUID milkTypeUuid,

        UUID collectionMethodUuid,

        UUID paymentCycleUuid,

        UUID rateCategoryUuid,

        UUID milkRateChartUuid,

        LocalDate configEffectiveFrom,

        String billingCycle,

        @Valid
        FarmerConfigurationRequest farmerConfiguration

) {
    public record FarmerConfigurationRequest(

            @NotNull(message = "Milk Type UUID is required for farmer configuration")
            UUID milkTypeUuid,

            @NotNull(message = "Collection Method UUID is required for farmer configuration")
            UUID collectionMethodUuid,

            UUID paymentCycleUuid,

            @NotNull(message = "Rate Category UUID is required for farmer configuration")
            UUID rateCategoryUuid,

            @NotNull(message = "Milk Rate Chart UUID is required for farmer configuration")
            UUID milkRateChartUuid,

                        @NotNull(message = "Configuration Effective From date is required for farmer configuration")
                        LocalDate configEffectiveFrom,

                        String billingCycle

    ) {
    }
}