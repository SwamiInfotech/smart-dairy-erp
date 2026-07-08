package com.smartdairy.settlement.mapper;

import com.smartdairy.settlement.dto.GenerateSettlementRequest;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.entity.Settlement;
import com.smartdairy.settlement.enums.SettlementStatus;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class SettlementMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)

    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "farmer", ignore = true)

    @Mapping(target = "settlementNo", ignore = true)

    @Mapping(target = "milkAmount", ignore = true)

    @Mapping(target = "status", ignore = true)

    @Mapping(target = "active", ignore = true)
    public abstract Settlement toEntity(GenerateSettlementRequest request);

    @AfterMapping
    protected void afterMapping(@MappingTarget Settlement entity) {

        entity.setStatus(SettlementStatus.GENERATED);
        entity.setActive(true);
    }

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")
    public abstract SettlementResponse toResponse(Settlement entity);
}