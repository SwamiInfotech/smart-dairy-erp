package com.smartdairy.milkcollection.service;

import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkcollection.dto.DailyMilkCollectionSummaryResponse;
import com.smartdairy.milkcollection.repository.MilkCollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DailyMilkCollectionSummaryService {

    private final MilkCollectionRepository repository;

    public DailyMilkCollectionSummaryResponse summary(LocalDate date){

        return repository.getDailySummary(date)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No Milk Collection found."));
    }

}