package com.smartdairy.paymentcycle.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.paymentcycle.dto.CreatePaymentCycleRequest;
import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.mapper.PaymentCycleMapper;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CreatePaymentCycleService {

    private final PaymentCycleRepository repository;
    private final PaymentCycleMapper mapper;

    @CacheEvict(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantKey()")
    public PaymentCycleResponse create(CreatePaymentCycleRequest request) {
        log.info("Creating payment cycle with code={}", request.getCode());

        if (repository.existsByCodeAndTenantUuid(request.getCode(), TenantContextHolder.getTenantUuidOrFallback())) {
            log.warn("Payment cycle creation failed because code={} already exists.", request.getCode());
            throw new BusinessException("Payment cycle code already exists.");
        }

        PaymentCycle entity = mapper.toEntity(request);
        entity.setActive(true);

        PaymentCycle saved = repository.save(entity);
        log.info("Payment cycle created successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
