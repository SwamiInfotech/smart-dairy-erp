package com.smartdairy.tenant.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TenantResponse(
        UUID uuid,
        String code,
        String name,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
