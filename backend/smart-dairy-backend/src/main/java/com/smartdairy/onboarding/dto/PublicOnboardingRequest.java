package com.smartdairy.onboarding.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicOnboardingRequest(
        @NotBlank(message = "Tenant code is required")
        @Size(max = 50, message = "Tenant code must be at most 50 characters")
        String tenantCode,

        @NotBlank(message = "Tenant name is required")
        @Size(max = 150, message = "Tenant name must be at most 150 characters")
        String tenantName,

        @NotBlank(message = "Company code is required")
        @Size(max = 20, message = "Company code must be at most 20 characters")
        String companyCode,

        @NotBlank(message = "Company name is required")
        @Size(max = 150, message = "Company name must be at most 150 characters")
        String companyName,

        @Size(max = 150, message = "Owner name must be at most 150 characters")
        String ownerName,

        @Size(max = 20, message = "Mobile number must be at most 20 characters")
        String mobileNo,

        @Email(message = "Email must be valid")
        @Size(max = 100, message = "Email must be at most 100 characters")
        String email,

        String gstNo,
        String address,
        String city,
        String state,
        String country,
        String pincode,

        @Size(max = 20, message = "Branch code must be at most 20 characters")
        String branchCode,

        @Size(max = 150, message = "Branch name must be at most 150 characters")
        String branchName,

        @Size(max = 150, message = "Branch manager name must be at most 150 characters")
        String branchManagerName,

        @Size(max = 20, message = "Branch mobile number must be at most 20 characters")
        String branchMobileNo,

        @Email(message = "Branch email must be valid")
        @Size(max = 100, message = "Branch email must be at most 100 characters")
        String branchEmail,

        String branchAddress,
        String branchCity,
        String branchState,
        String branchCountry,
        String branchPincode,

        @NotBlank(message = "Admin username is required")
        @Size(max = 100, message = "Admin username must be at most 100 characters")
        String adminUsername,

        @NotBlank(message = "Admin password is required")
        @Size(min = 8, max = 100, message = "Admin password must be between 8 and 100 characters")
        String adminPassword,

        @NotBlank(message = "Admin full name is required")
        @Size(max = 150, message = "Admin full name must be at most 150 characters")
        String adminFullName
) {
}
