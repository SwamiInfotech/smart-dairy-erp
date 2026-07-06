package com.smartdairy.pricing.service;

import com.smartdairy.farmer.entity.Farmer;
import com.smartdairy.pricing.dto.RateCalculationResult;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface RateResolverService {

    RateCalculationResult calculateFatRate(
            Farmer farmer,
            LocalDate collectionDate,
            BigDecimal quantity,
            BigDecimal fat,
            BigDecimal snf
    );

    RateCalculationResult calculateMavaRate(
            Farmer farmer,
            LocalDate collectionDate,
            BigDecimal quantity,
            BigDecimal mava);

}