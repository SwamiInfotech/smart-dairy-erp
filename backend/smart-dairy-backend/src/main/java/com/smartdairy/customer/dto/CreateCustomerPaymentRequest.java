package com.smartdairy.customer.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateCustomerPaymentRequest(

        @NotNull
        UUID customerUuid,

        @NotNull
        LocalDate paymentDate,

        @DecimalMin("0.01")
        BigDecimal amount,

        @NotNull
        UUID paymentModeUuid,

        String referenceNo,

        String remarks

) {
}