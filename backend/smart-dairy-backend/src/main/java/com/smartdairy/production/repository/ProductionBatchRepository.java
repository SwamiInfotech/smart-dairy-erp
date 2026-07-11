package com.smartdairy.production.repository;

import com.smartdairy.production.entity.ProductionBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, Long>, JpaSpecificationExecutor<ProductionBatch> {

    Optional<ProductionBatch> findByUuid(UUID uuid);

    boolean existsByBatchNo(String batchNo);

    long count();

    long countByBatchNoStartingWith(String prefix);
}