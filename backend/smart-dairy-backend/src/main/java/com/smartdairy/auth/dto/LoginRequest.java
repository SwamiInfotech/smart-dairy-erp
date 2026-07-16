package com.smartdairy.auth.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record LoginRequest(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password,

        UUID tenantUuid  // Optional: if provided, login to this specific tenant
) {
}
