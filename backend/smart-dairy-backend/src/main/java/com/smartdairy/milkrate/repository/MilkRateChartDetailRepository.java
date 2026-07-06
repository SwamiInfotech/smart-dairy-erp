package com.smartdairy.milkrate.repository;

import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface MilkRateChartDetailRepository
        extends JpaRepository<MilkRateChartDetail, Long> {

    Optional<MilkRateChartDetail> findByUuid(UUID uuid);

    @Query("""
            SELECT d
            FROM MilkRateChartDetail d
            WHERE d.milkRateChart.id = :chartId
              AND :fat BETWEEN d.fatFrom AND d.fatTo
              AND (
                    d.snfFrom IS NULL
                    OR :snf BETWEEN d.snfFrom AND d.snfTo
                  )
            """)
    Optional<MilkRateChartDetail> findFatRate(
            Long chartId,
            BigDecimal fat,
            BigDecimal snf);

    @Query("""
            SELECT d
            FROM MilkRateChartDetail d
            WHERE d.milkRateChart.id = :chartId
              AND :mava BETWEEN d.mavaFrom AND d.mavaTo
            """)
    Optional<MilkRateChartDetail> findMavaRate(
            Long chartId,
            BigDecimal mava);
}