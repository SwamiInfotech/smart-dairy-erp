package com.smartdairy.production.service.impl;

import com.smartdairy.production.repository.ProductionBatchRepository;
import com.smartdairy.production.service.ProductionBatchNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ProductionBatchNumberGeneratorImpl
        implements ProductionBatchNumberGenerator {

    private final ProductionBatchRepository repository;

    @Override
    public String generate() {

        LocalDate today = LocalDate.now();

        String prefix = "PB" +
                today.format(DateTimeFormatter.BASIC_ISO_DATE);

        long count =
                repository.countByBatchNoStartingWith(prefix);

        return prefix + String.format("%04d", count + 1);

    }

}