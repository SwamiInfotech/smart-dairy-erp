package com.smartdairy.rateprofile.mapper;

import com.smartdairy.rateprofile.dto.CreateRateCategoryRequest;
import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.dto.UpdateRateCategoryRequest;
import com.smartdairy.rateprofile.entity.RateCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RateCategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    RateCategory toEntity(CreateRateCategoryRequest request);

    RateCategoryResponse toResponse(RateCategory entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(UpdateRateCategoryRequest request, @MappingTarget RateCategory entity);
}
