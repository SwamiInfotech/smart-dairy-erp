package com.smartdairy.paymentcycle.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.mapper.PaymentCycleMapper;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetPaymentCycleByUuidService {

    private final PaymentCycleRepository repository;
    private final PaymentCycleMapper mapper;

    @Cacheable(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    public PaymentCycleResponse getByUuid(UUID uuid) {
        log.info("Fetching payment cycle by uuid={}", uuid);
        return repository.findByUuid(uuid)
                .map(mapper::toResponse)
                .orElseThrow(() -> {
                    log.warn("Payment cycle not found for uuid={}", uuid);
                    return new ResourceNotFoundException("Payment cycle not found.");
                });
    }
}
