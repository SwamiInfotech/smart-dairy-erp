package com.smartdairy.customer.repository;

import com.smartdairy.customer.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerPaymentRepository
        extends JpaRepository<CustomerPayment,Long> {

    Optional<CustomerPayment> findByUuid(UUID uuid);

}