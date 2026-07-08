package com.smartdairy.loan.mapper;

import com.smartdairy.loan.dto.AdvanceResponse;
import com.smartdairy.loan.dto.CreateAdvanceRequest;
import com.smartdairy.loan.entity.Advance;
import com.smartdairy.loan.entity.Loan;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class AdvanceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)

    @Mapping(target = "advanceNo", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "farmer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "active", ignore = true)

    public abstract Advance toEntity(CreateAdvanceRequest request);

    @AfterMapping
    protected void afterMapping(@MappingTarget Advance entity){

        entity.setStatus(com.smartdairy.loan.enums.AdvanceStatus.PENDING);
        entity.setActive(true);
    }

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")
    public abstract AdvanceResponse toResponse(Advance entity);

}