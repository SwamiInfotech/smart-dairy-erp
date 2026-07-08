package com.smartdairy.payment.service.impl;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.mapper.PaymentMapper;
import com.smartdairy.payment.repository.PaymentRepository;
import com.smartdairy.payment.service.GetPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetPaymentServiceImpl implements GetPaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper mapper;

    @Override
    public PaymentResponse getByUuid(UUID uuid) {

        return paymentRepository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found."));
    }
}