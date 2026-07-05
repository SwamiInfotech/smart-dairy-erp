package com.smartdairy.branch.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateBranchRequest(

        UUID companyUuid,

        @NotBlank
        String branchCode,

        @NotBlank
        String branchName,

        String managerName,

        String mobileNo,

        String email,

        String address,

        String city,

        String state,

        String country,

        String pincode
) {
}