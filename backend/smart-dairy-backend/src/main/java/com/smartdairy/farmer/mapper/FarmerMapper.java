package com.smartdairy.farmer.mapper;

import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
    Farmer toEntity(CreateFarmerRequest request);

    @Mapping(target = "branchUuid", source = "branch.uuid")
    FarmerResponse toResponse(Farmer farmer);
}