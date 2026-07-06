package com.smartdairy.pricing.dto;

import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import com.smartdairy.milkrate.entity.MilkRateChart;

import java.math.BigDecimal;

public record RateCalculationResult(

        FarmerConfiguration farmerConfiguration,

        MilkRateChart milkRateChart,

        BigDecimal calculatedRate,

        BigDecimal grossAmount

) {
}