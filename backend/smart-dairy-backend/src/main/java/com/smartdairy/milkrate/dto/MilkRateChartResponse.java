package com.smartdairy.milkrate.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MilkRateChartResponse(

        UUID uuid,

        UUID branchUuid,

        UUID rateCategoryUuid,

        UUID collectionMethodUuid,

        String chartName,

        LocalDate effectiveFrom,

        LocalDate effectiveTo,

        String remarks,

        Boolean active,

        List<MilkRateChartDetailResponse> details

) {
}