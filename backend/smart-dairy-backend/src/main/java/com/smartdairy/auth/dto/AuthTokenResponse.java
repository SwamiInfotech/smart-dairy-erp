package com.smartdairy.auth.dto;

import java.util.List;
import java.util.UUID;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String role,
        String tenantUuid,
        String defaultTenantUuid,
        String companyUuid,
        String companyName,
        String branchUuid,
        String branchName,
        List<String> accessibleTenants
) {
}
