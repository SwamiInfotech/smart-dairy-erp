package com.smartdairy.milkrate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateMilkRateChartRequest(

        @NotNull
        UUID branchUuid,

        @NotNull
        UUID rateCategoryUuid,

        @NotNull
        UUID collectionMethodUuid,

        @NotBlank
        String chartName,

        @NotNull
        LocalDate effectiveFrom,

        String remarks,

        @Valid
        @NotEmpty
        List<CreateMilkRateChartDetailRequest> details

) {
}