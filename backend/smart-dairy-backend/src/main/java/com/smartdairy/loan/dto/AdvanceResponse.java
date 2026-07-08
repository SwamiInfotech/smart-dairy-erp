package com.smartdairy.loan.dto;

import com.smartdairy.loan.enums.AdvanceStatus;
import com.smartdairy.loan.enums.LoanStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AdvanceResponse(

        UUID uuid,

        String advanceNo,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        LocalDate advanceDate,

        BigDecimal advanceAmount,

        AdvanceStatus status,

        String remarks

) {
}