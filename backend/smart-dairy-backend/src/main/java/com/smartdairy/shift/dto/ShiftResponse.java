package com.smartdairy.shift.dto;

import java.util.UUID;

public record ShiftResponse(

        UUID uuid,

        String code,

        String name,

        String description,

        Integer displayOrder,

        Boolean active

) {
}
