package com.smartdairy.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerLedgerResponse(

        UUID uuid,

        LocalDate transactionDate,

        String referenceType,

        String referenceNumber,

        BigDecimal debitAmount,

        BigDecimal creditAmount,

        BigDecimal balance,

        String remarks

) {
}