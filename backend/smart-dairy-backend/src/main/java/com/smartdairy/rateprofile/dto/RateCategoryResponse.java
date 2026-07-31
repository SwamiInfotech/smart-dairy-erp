package com.smartdairy.rateprofile.dto;

import java.util.UUID;

public record RateCategoryResponse(
        UUID uuid,
        String code,
        String name,
        String description,
        Integer displayOrder,
        Boolean active
) {
}
