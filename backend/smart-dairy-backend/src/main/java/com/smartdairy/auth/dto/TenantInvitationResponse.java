package com.smartdairy.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TenantInvitationResponse(
        UUID uuid,
        UUID invitationToken,
        UUID tenantUuid,
        String tenantCode,
        String tenantName,
        String invitedUsername,
        String invitedFullName,
        String role,
        String permissions,
        String status,
        String invitedByUsername,
        String acceptedByUsername,
        LocalDateTime expiresAt,
        LocalDateTime respondedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
