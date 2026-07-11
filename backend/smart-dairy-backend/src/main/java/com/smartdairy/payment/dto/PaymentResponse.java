package com.smartdairy.payment.dto;

import com.smartdairy.common.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentResponse(

        UUID uuid,

        String paymentNo,

        UUID settlementUuid,

        String settlementNo,

        UUID farmerUuid,

        String farmerCode,

        String farmerName,

        LocalDate paymentDate,

        BigDecimal paidAmount,

        PaymentMode paymentMode,

        String remarks

) {
}