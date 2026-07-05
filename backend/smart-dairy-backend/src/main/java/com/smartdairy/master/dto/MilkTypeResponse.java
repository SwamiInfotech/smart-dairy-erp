package com.smartdairy.master.dto;

import java.util.UUID;

public record MilkTypeResponse(

        UUID uuid,

        String code,

        String name,

        String description

) {
}