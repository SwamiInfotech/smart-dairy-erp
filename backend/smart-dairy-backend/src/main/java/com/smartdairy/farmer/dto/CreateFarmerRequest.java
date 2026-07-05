package com.smartdairy.farmer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateFarmerRequest(

        @NotNull
        UUID branchUuid,

        @NotBlank
        String farmerCode,

        @NotBlank
        String farmerName,

        String mobileNo,

        String alternateMobileNo,

        String email,

        String address,

        @NotBlank
        String village,

        String taluka,

        String district,

        String state,

        String pincode,

        String aadharNo,

        String panNo,

        String photoUrl,

        String remarks

) {
}