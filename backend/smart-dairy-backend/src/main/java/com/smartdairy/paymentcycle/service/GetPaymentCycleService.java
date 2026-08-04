package com.smartdairy.paymentcycle.service;

import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.mapper.PaymentCycleMapper;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetPaymentCycleService {

    private final PaymentCycleRepository repository;
    private final PaymentCycleMapper mapper;

    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "paymentCycles",
            key = "T(com.smartdairy.config.CacheKeys).tenantKey()"
    )
    public List<PaymentCycleResponse> getAll() {
        log.info("Fetching all payment cycles.");
        List<PaymentCycleResponse> response = repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
        log.info("Fetched {} payment cycles.", response.size());
        return response;
    }
}
