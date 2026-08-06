package com.smartdairy.farmer.mapper;

import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FarmerMapper {

    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "milkRateChart", ignore = true)
    @Mapping(target = "active", ignore = true)
    Farmer toEntity(CreateFarmerRequest request);

    @Mapping(target = "branchUuid", source = "branch.uuid")
    @Mapping(target = "milkRateChartUuid", source = "milkRateChart.uuid")
    @Mapping(target = "milkTypeUuid", ignore = true)
    @Mapping(target = "collectionMethodUuid", ignore = true)
    @Mapping(target = "paymentCycleUuid", ignore = true)
    @Mapping(target = "rateCategoryUuid", ignore = true)
    @Mapping(target = "configEffectiveFrom", ignore = true)
    FarmerResponse toResponse(Farmer farmer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "milkRateChart", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(CreateFarmerRequest request, @MappingTarget Farmer farmer);
}