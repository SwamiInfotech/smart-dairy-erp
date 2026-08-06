package com.smartdairy.farmer.dto;

import java.time.LocalDate;
import java.util.UUID;

public record FarmerResponse(

        UUID uuid,

        UUID branchUuid,

        UUID milkRateChartUuid,

        String farmerCode,

        String farmerName,

        String mobileNo,

        String alternateMobileNo,

        String email,

        String address,

        String village,

        String taluka,

        String district,

        String state,

        String pincode,

        String aadharNo,

        String panNo,

        String photoUrl,

        String remarks,

        UUID milkTypeUuid,

        UUID collectionMethodUuid,

        UUID paymentCycleUuid,

        UUID rateCategoryUuid,

        LocalDate configEffectiveFrom,

        Boolean active

) {
}