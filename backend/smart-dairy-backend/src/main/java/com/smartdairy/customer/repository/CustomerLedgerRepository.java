package com.smartdairy.customer.repository;

import com.smartdairy.customer.entity.Customer;
import com.smartdairy.customer.entity.CustomerLedger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomerLedgerRepository extends JpaRepository<CustomerLedger, Long> {

    List<CustomerLedger> findByCustomerOrderByTransactionDateAscIdAsc(Customer customer);

    List<CustomerLedger> findByReferenceUuid(UUID referenceUuid);

    List<CustomerLedger> findByCustomerUuidOrderByTransactionDateAscIdAsc(UUID customerUuid);
}