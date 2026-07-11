package com.smartdairy.customer.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateCustomerRequest(

        @NotNull
        UUID branchUuid,

        @NotBlank
        String customerName,

        @NotBlank
        String mobileNo,

        String alternateMobileNo,

        @Email
        String email,

        String address,

        String city,

        String state,

        String pincode,

        String gstNo,

        @DecimalMin("0.00")
        BigDecimal creditLimit,

        @DecimalMin("0.00")
        BigDecimal openingBalance

) {
}