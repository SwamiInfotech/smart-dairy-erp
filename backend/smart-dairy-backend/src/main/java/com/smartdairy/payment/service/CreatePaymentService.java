package com.smartdairy.payment.service;

import com.smartdairy.payment.dto.CreatePaymentRequest;
import com.smartdairy.payment.dto.PaymentResponse;

public interface CreatePaymentService {

    PaymentResponse create(CreatePaymentRequest request);

}