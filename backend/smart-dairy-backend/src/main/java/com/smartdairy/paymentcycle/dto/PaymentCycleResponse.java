package com.smartdairy.paymentcycle.dto;

import java.util.UUID;

public record PaymentCycleResponse(
        UUID uuid,
        String code,
        String name,
        String description,
        Integer displayOrder,
        Boolean active
) {
}
