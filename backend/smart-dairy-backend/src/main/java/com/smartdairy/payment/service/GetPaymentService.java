package com.smartdairy.payment.service;

import com.smartdairy.payment.dto.PaymentResponse;

import java.util.UUID;

public interface GetPaymentService {

    PaymentResponse getByUuid(UUID uuid);

}