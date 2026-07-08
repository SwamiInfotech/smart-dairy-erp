package com.smartdairy.payment.dto;

import com.smartdairy.payment.enums.PaymentMode;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreatePaymentRequest(

        @NotNull
        UUID settlementUuid,

        @NotNull
        LocalDate paymentDate,

        @NotNull
        PaymentMode paymentMode,

        String remarks

) {
}