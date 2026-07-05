package com.smartdairy.farmer.mapper;

import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.entity.Farmer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FarmerMapper {

    Farmer toEntity(CreateFarmerRequest request);

    @Mapping(target = "branchUuid", source = "branch.uuid")
    FarmerResponse toResponse(Farmer farmer);
}