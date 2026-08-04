package com.smartdairy.paymentcycle.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import com.smartdairy.paymentcycle.repository.PaymentCycleRepository;
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
public class DeletePaymentCycleService {

    private final PaymentCycleRepository repository;

    @Caching(evict = {
            @CacheEvict(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantKey()"),
            @CacheEvict(cacheNames = "paymentCycles", key = "T(com.smartdairy.config.CacheKeys).tenantRecordKey(#uuid)")
    })
    public void delete(UUID uuid) {
        log.info("Deleting payment cycle with uuid={}", uuid);

        PaymentCycle entity = repository.findByUuid(uuid)
                .orElseThrow(() -> {
                    log.warn("Payment cycle delete failed because uuid={} was not found.", uuid);
                    return new ResourceNotFoundException("Payment cycle not found.");
                });

        entity.setActive(false);
        repository.save(entity);
        log.info("Payment cycle deleted successfully with uuid={}", uuid);
    }
}
