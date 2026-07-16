package com.smartdairy.auth.dto;

import com.smartdairy.auth.entity.UserTenantRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateTenantInvitationRequest(
        @NotBlank(message = "Invited username is required")
        @Size(max = 100, message = "Invited username must be at most 100 characters")
        String invitedUsername,

        @Size(max = 150, message = "Invited full name must be at most 150 characters")
        String invitedFullName,

        @NotNull(message = "Role is required")
        UserTenantRole role,

        @Size(max = 2000, message = "Permissions must be at most 2000 characters")
        String permissions,

        @Positive(message = "Expires in days must be greater than 0")
        Integer expiresInDays
) {
}
