package com.smartdairy.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(

        @NotBlank
        String companyCode,

        @NotBlank
        String companyName,

        String ownerName,

        String mobileNo,

        @Email
        String email,

        String gstNo,

        String address,

        String city,

        String state,

        String country,

        String pincode
) {
}