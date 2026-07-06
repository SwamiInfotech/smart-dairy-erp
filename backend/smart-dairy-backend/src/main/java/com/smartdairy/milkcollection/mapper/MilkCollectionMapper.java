package com.smartdairy.milkcollection.mapper;

import com.smartdairy.common.enums.EntrySource;
import com.smartdairy.common.enums.EntryType;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.entity.MilkCollection;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class MilkCollectionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)

    @Mapping(target = "collectionNo", ignore = true)

    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "farmer", ignore = true)
    @Mapping(target = "farmerConfiguration", ignore = true)
    @Mapping(target = "milkRateChart", ignore = true)
    @Mapping(target = "shift", ignore = true)
    @Mapping(target = "milkType", ignore = true)
    @Mapping(target = "collectionMethod", ignore = true)

    @Mapping(target = "calculatedRate", ignore = true)
    @Mapping(target = "grossAmount", ignore = true)

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)

    public abstract MilkCollection toEntity(CreateMilkCollectionRequest request);

    @AfterMapping
    protected void afterMapping(@MappingTarget MilkCollection entity) {

        entity.setLocked(false);
        entity.setEntryType(EntryType.LIVE);
        entity.setEntrySource(EntrySource.WEB);
    }

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")

    @Mapping(target = "shiftUuid", source = "shift.uuid")
    @Mapping(target = "shift", source = "shift.name")

    @Mapping(target = "milkTypeUuid", source = "milkType.uuid")
    @Mapping(target = "milkType", source = "milkType.name")

    public abstract MilkCollectionResponse toResponse(MilkCollection entity);

}