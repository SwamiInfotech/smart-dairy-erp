package com.smartdairy.payment.service.impl;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.payment.dto.CreatePaymentRequest;
import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.entity.Payment;
import com.smartdairy.payment.mapper.PaymentMapper;
import com.smartdairy.payment.repository.PaymentRepository;
import com.smartdairy.payment.service.CreatePaymentService;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import com.smartdairy.settlement.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class CreatePaymentServiceImpl implements CreatePaymentService {

    private final PaymentRepository paymentRepository;
    private final SettlementRepository settlementRepository;
    private final PaymentMapper mapper;

    @Override
    public PaymentResponse create(CreatePaymentRequest request) {

        Settlement settlement = settlementRepository.findByUuid(request.settlementUuid())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Settlement not found."));

        if (settlement.getStatus() == SettlementStatus.PAID) {
            throw new BusinessException("Settlement is already paid.");
        }

        if (paymentRepository.existsBySettlementUuid(request.settlementUuid())) {
            throw new BusinessException("Payment already exists for this settlement.");
        }

        Payment payment = mapper.toEntity(request);

        payment.setPaymentNo(generatePaymentNo());

        payment.setBranch(settlement.getBranch());

        payment.setFarmer(settlement.getFarmer());

        payment.setSettlement(settlement);

        payment.setPaidAmount(settlement.getNetPayable());

        payment.setActive(true);

        settlement.setStatus(SettlementStatus.PAID);

        Payment saved = paymentRepository.save(payment);

        return mapper.toResponse(saved);
    }

    private String generatePaymentNo() {

        return "PAY"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + ThreadLocalRandom.current().nextInt(1000, 9999);
    }
}