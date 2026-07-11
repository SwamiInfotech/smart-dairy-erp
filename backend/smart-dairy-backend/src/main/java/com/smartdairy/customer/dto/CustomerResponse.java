package com.smartdairy.customer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CustomerResponse(

        UUID uuid,

        String customerCode,

        String customerName,

        String mobileNo,

        String alternateMobileNo,

        String email,

        String address,

        String city,

        String state,

        String pincode,

        String gstNo,

        BigDecimal creditLimit,

        BigDecimal openingBalance,

        BigDecimal currentBalance,

        Boolean active

) {
}