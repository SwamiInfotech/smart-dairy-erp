package com.smartdairy.company.dto;

import java.util.UUID;

public record CompanyResponse(

        UUID uuid,

        String companyCode,

        String companyName,

        String ownerName,

        String mobileNo,

        String email,

        boolean active

) {
}