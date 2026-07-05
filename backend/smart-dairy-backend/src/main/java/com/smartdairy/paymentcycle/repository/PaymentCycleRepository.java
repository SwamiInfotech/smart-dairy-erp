package com.smartdairy.paymentcycle.repository;

import com.smartdairy.paymentcycle.entity.PaymentCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentCycleRepository extends JpaRepository<PaymentCycle, Long> {

    Optional<PaymentCycle> findByUuid(UUID uuid);

    Optional<PaymentCycle> findByCode(String code);

}