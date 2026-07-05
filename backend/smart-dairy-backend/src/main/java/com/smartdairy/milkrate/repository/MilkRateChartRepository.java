package com.smartdairy.milkrate.repository;

import com.smartdairy.milkrate.entity.MilkRateChart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MilkRateChartRepository extends JpaRepository<MilkRateChart, Long> {

    Optional<MilkRateChart> findByUuid(UUID uuid);

}