package com.smartdairy.payment.service;

import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.dto.PaymentSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchPaymentService {

    Page<PaymentResponse> search(
            PaymentSearchRequest request,
            Pageable pageable);

}