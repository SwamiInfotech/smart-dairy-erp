package com.smartdairy.milkrate.repository;

import com.smartdairy.milkrate.entity.MilkRateChart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MilkRateChartRepository extends JpaRepository<MilkRateChart, Long> {

    Optional<MilkRateChart> findByUuid(UUID uuid);

    Optional<MilkRateChart> findByBranchIdAndRateCategoryIdAndCollectionMethodIdAndActiveTrue(
            Long branchId,
            Long rateCategoryId,
            Long collectionMethodId);

    @Query("""
            SELECT m
            FROM MilkRateChart m
            WHERE m.branch.id = :branchId
            AND m.rateCategory.id = :rateCategoryId
            AND m.collectionMethod.id = :collectionMethodId
            AND :collectionDate >= m.effectiveFrom
            AND (
                    m.effectiveTo IS NULL
                    OR :collectionDate <= m.effectiveTo
                )
            """)
    Optional<MilkRateChart> findApplicableChart(
            Long branchId,
            Long rateCategoryId,
            Long collectionMethodId,
            LocalDate collectionDate);

}