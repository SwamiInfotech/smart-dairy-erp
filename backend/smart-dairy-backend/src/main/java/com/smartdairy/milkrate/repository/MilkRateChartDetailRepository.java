package com.smartdairy.milkrate.repository;

import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilkRateChartDetailRepository extends JpaRepository<MilkRateChartDetail, Long> {

    List<MilkRateChartDetail> findByMilkRateChartId(Long milkRateChartId);

}