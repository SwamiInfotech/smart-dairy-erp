package com.smartdairy.branch.dto;

import java.util.UUID;

public record BranchResponse(

        UUID uuid,

        UUID companyUuid,

        String branchCode,

        String branchName,

        String managerName,

        String mobileNo,

        String email,

        String address,

        String city,

        String state,

        String country,

        String pincode,

        Boolean active

) {
}