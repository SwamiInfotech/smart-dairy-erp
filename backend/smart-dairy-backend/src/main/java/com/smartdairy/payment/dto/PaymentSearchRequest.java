package com.smartdairy.payment.dto;

import com.smartdairy.common.enums.PaymentMode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class PaymentSearchRequest {

    private UUID farmerUuid;

    private UUID settlementUuid;

    private PaymentMode paymentMode;

    private LocalDate fromDate;

    private LocalDate toDate;

}