package com.smartdairy.inventory.repository;

import com.smartdairy.inventory.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryTransactionRepository extends
        JpaRepository<InventoryTransaction, Long>,
        JpaSpecificationExecutor<InventoryTransaction> {

    Optional<InventoryTransaction> findByUuid(UUID uuid);

    @Query("""
            SELECT
                COALESCE(SUM(i.quantityIn), 0) -
                COALESCE(SUM(i.quantityOut), 0)
            FROM InventoryTransaction i
            WHERE i.product.uuid = :productUuid
            """)
    BigDecimal getCurrentStock(UUID productUuid);

    List<InventoryTransaction> findByReferenceUuidOrderById(UUID referenceUuid);

    Page<InventoryTransaction> findByProductUuid(
            UUID productUuid,
            Pageable pageable);

    boolean existsByProductUuid(UUID productUuid);
}