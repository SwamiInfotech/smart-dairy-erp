package com.smartdairy.milkrate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateMilkRateChartRequest(

        @NotBlank
        String chartName,

        @NotNull
        LocalDate effectiveFrom,

        LocalDate effectiveTo,

        String remarks,

        Boolean active,

        @Valid
        @NotEmpty
        List<CreateMilkRateChartDetailRequest> details

) {
}
