package com.smartdairy.payment.service.impl;

import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.dto.PaymentSearchRequest;
import com.smartdairy.payment.mapper.PaymentMapper;
import com.smartdairy.payment.repository.PaymentRepository;
import com.smartdairy.payment.service.SearchPaymentService;
import com.smartdairy.payment.specification.PaymentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchPaymentServiceImpl implements SearchPaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper mapper;

    @Override
    public Page<PaymentResponse> search(
            PaymentSearchRequest request,
            Pageable pageable) {

        return paymentRepository.findAll(
                        PaymentSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);
    }
}