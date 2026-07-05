package com.smartdairy.farmerconfiguration.mapper;

import com.smartdairy.farmerconfiguration.dto.CreateFarmerConfigurationRequest;
import com.smartdairy.farmerconfiguration.dto.FarmerConfigurationResponse;
import com.smartdairy.farmerconfiguration.entity.FarmerConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FarmerConfigurationMapper {

    FarmerConfiguration toEntity(CreateFarmerConfigurationRequest request);

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")

    @Mapping(target = "milkTypeUuid", source = "milkType.uuid")
    @Mapping(target = "milkType", source = "milkType.name")

    @Mapping(target = "collectionMethodUuid", source = "collectionMethod.uuid")
    @Mapping(target = "collectionMethod", source = "collectionMethod.name")

    @Mapping(target = "paymentCycleUuid", source = "paymentCycle.uuid")
    @Mapping(target = "paymentCycle", source = "paymentCycle.name")

    @Mapping(target = "rateCategoryUuid", source = "rateCategory.uuid")
    @Mapping(target = "rateCategory", source = "rateCategory.name")
    FarmerConfigurationResponse toResponse(FarmerConfiguration entity);

}