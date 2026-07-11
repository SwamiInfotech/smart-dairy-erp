package com.smartdairy.customer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CustomerOutstandingResponse(

        UUID customerUuid,
        String customerCode,
        String customerName,
        BigDecimal outstandingAmount

) {
}