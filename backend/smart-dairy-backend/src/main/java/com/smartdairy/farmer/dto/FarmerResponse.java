package com.smartdairy.farmer.dto;

import java.util.UUID;

public record FarmerResponse(

        UUID uuid,

        UUID branchUuid,

        UUID milkRateChartUuid,

        String farmerCode,

        String farmerName,

        String mobileNo,

        String village,

        Boolean active

) {
}