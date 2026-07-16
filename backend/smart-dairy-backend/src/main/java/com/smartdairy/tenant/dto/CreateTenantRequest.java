package com.smartdairy.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTenantRequest(
        @NotBlank(message = "Tenant code is required")
        @Size(max = 50, message = "Tenant code must be at most 50 characters")
        String code,

        @NotBlank(message = "Tenant name is required")
        @Size(max = 150, message = "Tenant name must be at most 150 characters")
        String name
) {
}
