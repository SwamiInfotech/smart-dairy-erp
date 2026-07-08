package com.smartdairy.payment.repository;

import com.smartdairy.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends
        JpaRepository<Payment, Long>,
        JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByUuid(UUID uuid);

    boolean existsBySettlementUuid(UUID settlementUuid);

}