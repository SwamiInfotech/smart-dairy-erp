package com.smartdairy.settlement.dto;

import com.smartdairy.settlement.enums.SettlementStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementResponse(

        UUID uuid,

        String settlementNo,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        LocalDate fromDate,

        LocalDate toDate,

        BigDecimal milkAmount,

        BigDecimal bonusAmount,

        BigDecimal loanRecovery,

        BigDecimal advanceRecovery,

        BigDecimal otherDeduction,

        BigDecimal netPayable,

        SettlementStatus status,

        String remarks

) {
}