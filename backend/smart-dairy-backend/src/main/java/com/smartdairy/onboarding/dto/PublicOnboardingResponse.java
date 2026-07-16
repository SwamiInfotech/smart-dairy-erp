package com.smartdairy.onboarding.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PublicOnboardingResponse(
        UUID tenantUuid,
        String tenantCode,
        String tenantName,
        UUID companyUuid,
        String companyCode,
        String companyName,
        UUID branchUuid,
        String branchCode,
        String branchName,
        UUID adminUserUuid,
        String adminUsername,
        String adminRole,
        LocalDate trialStartDate,
        LocalDate trialEndDate,
        String loginEndpoint,
        LocalDateTime onboardedAt
) {
}
