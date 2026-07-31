package com.smartdairy.collectionmethod.mapper;

import com.smartdairy.collectionmethod.dto.CreateCollectionMethodRequest;
import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.dto.UpdateCollectionMethodRequest;
import com.smartdairy.collectionmethod.entity.CollectionMethod;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CollectionMethodMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    CollectionMethod toEntity(CreateCollectionMethodRequest request);

    CollectionMethodResponse toResponse(CollectionMethod entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(UpdateCollectionMethodRequest request, @MappingTarget CollectionMethod entity);
}
