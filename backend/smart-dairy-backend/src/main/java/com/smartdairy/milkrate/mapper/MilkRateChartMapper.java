package com.smartdairy.milkrate.mapper;

import com.smartdairy.milkrate.dto.*;
import com.smartdairy.milkrate.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MilkRateChartMapper {

    MilkRateChart toEntity(CreateMilkRateChartRequest request);

    MilkRateChartDetail toEntity(CreateMilkRateChartDetailRequest request);

    MilkRateChartDetailResponse toResponse(MilkRateChartDetail entity);

    List<MilkRateChartDetailResponse> toResponse(List<MilkRateChartDetail> entity);

    @Mapping(target = "branchUuid", source = "branch.uuid")
    @Mapping(target = "rateCategoryUuid", source = "rateCategory.uuid")
    @Mapping(target = "collectionMethodUuid", source = "collectionMethod.uuid")
    MilkRateChartResponse toResponse(MilkRateChart entity);
}