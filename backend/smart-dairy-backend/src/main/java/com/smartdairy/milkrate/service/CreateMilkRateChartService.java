package com.smartdairy.milkrate.service;

import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import com.smartdairy.collectionmethod.repository.CollectionMethodRepository;
import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.milkrate.dto.CreateMilkRateChartDetailRequest;
import com.smartdairy.milkrate.dto.CreateMilkRateChartRequest;
import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.entity.MilkRateChart;
import com.smartdairy.milkrate.entity.MilkRateChartDetail;
import com.smartdairy.milkrate.mapper.MilkRateChartMapper;
import com.smartdairy.milkrate.repository.MilkRateChartRepository;
import com.smartdairy.rateprofile.entity.RateCategory;
import com.smartdairy.rateprofile.repository.RateCategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateMilkRateChartService {

    private final MilkRateChartRepository repository;

    private final BranchRepository branchRepository;
    private final RateCategoryRepository rateCategoryRepository;
    private final CollectionMethodRepository collectionMethodRepository;

    private final MilkRateChartMapper mapper;

    public MilkRateChartResponse create(CreateMilkRateChartRequest request) {

        Branch branch = branchRepository.findByUuid(request.branchUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found."));

        RateCategory rateCategory = rateCategoryRepository.findByUuid(request.rateCategoryUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Rate Category not found."));

        CollectionMethod collectionMethod = collectionMethodRepository
                .findByUuid(request.collectionMethodUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Collection Method not found."));

        repository.findByBranchIdAndRateCategoryIdAndCollectionMethodIdAndActiveTrue(
                        branch.getId(),
                        rateCategory.getId(),
                        collectionMethod.getId())
                .ifPresent(existing -> {

                    if (!request.effectiveFrom().isAfter(existing.getEffectiveFrom())) {
                        throw new BusinessException(
                                "Effective From must be greater than existing chart.");
                    }

                    existing.setEffectiveTo(request.effectiveFrom().minusDays(1));
                    existing.setActive(false);
                });

        MilkRateChart chart = mapper.toEntity(request);

        chart.setBranch(branch);
        chart.setRateCategory(rateCategory);
        chart.setCollectionMethod(collectionMethod);

        for (CreateMilkRateChartDetailRequest detailRequest : request.details()) {

            MilkRateChartDetail detail = mapper.toEntity(detailRequest);

            detail.setMilkRateChart(chart);

            chart.getDetails().add(detail);
        }

        MilkRateChart saved = repository.save(chart);

        return mapper.toResponse(saved);
    }
}