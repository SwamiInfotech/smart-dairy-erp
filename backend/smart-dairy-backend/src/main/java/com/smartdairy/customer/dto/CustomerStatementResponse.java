package com.smartdairy.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CustomerStatementResponse(

        UUID transactionUuid,

        LocalDate transactionDate,

        String referenceType,

        String referenceNumber,

        BigDecimal debitAmount,

        BigDecimal creditAmount,

        BigDecimal runningBalance,

        String remarks

) {
}