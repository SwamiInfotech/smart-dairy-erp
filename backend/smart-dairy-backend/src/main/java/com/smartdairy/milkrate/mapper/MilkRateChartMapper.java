package com.smartdairy.milkrate.mapper;

import com.smartdairy.milkrate.dto.*;
import com.smartdairy.milkrate.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MilkRateChartMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "rateCategory", ignore = true)
    @Mapping(target = "collectionMethod", ignore = true)
    @Mapping(target = "details", ignore = true)
    MilkRateChart toEntity(CreateMilkRateChartRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "milkRateChart", ignore = true)
    MilkRateChartDetail toEntity(CreateMilkRateChartDetailRequest request);

    MilkRateChartDetailResponse toResponse(MilkRateChartDetail entity);

    List<MilkRateChartDetailResponse> toResponse(List<MilkRateChartDetail> entity);

    @Mapping(target = "branchUuid", source = "branch.uuid")
    @Mapping(target = "rateCategoryUuid", source = "rateCategory.uuid")
    @Mapping(target = "collectionMethodUuid", source = "collectionMethod.uuid")
    MilkRateChartResponse toResponse(MilkRateChart entity);
}