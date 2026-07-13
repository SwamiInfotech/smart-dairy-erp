package com.smartdairy.auth.dto;

import com.smartdairy.auth.entity.UserRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record AuthUserResponse(
        UUID uuid,
        String username,
        String fullName,
        UserRole role,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
