package com.smartdairy.production.repository;

import com.smartdairy.production.entity.ProductionBatchItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionBatchItemRepository
        extends JpaRepository<ProductionBatchItem, Long> {

    List<ProductionBatchItem> findByProductionBatchId(Long productionBatchId);

}