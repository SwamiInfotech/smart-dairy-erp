package com.smartdairy.paymentcycle.service;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.dto.UpdatePaymentCycleRequest;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.mapper.PaymentCycleMapper;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
import com.smartdairy.tenant.context.TenantContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UpdatePaymentCycleService {

    private final PaymentCycleRepository repository;
    private final PaymentCycleMapper mapper;

    @Caching(evict = {
            @CacheEvict(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public PaymentCycleResponse update(UUID uuid, UpdatePaymentCycleRequest request) {
        log.info("Updating payment cycle with uuid={}", uuid);

        PaymentCycle entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Payment cycle update failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Payment cycle not found.");
                });

        UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();
        if (!entity.getCode().equalsIgnoreCase(request.getCode())
                && repository.existsByCodeAndTenantUuid(request.getCode(), tenantUuid)) {
            log.warn("Payment cycle update failed because code={} already exists.", request.getCode());
            throw new BusinessException("Payment cycle code already exists.");
        }

        mapper.updateEntity(request, entity);
        PaymentCycle saved = repository.save(entity);
        log.info("Payment cycle updated successfully with uuid={}", saved.getUuid());
        return mapper.toResponse(saved);
    }
}
