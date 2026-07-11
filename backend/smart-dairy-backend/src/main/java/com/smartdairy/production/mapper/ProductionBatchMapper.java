package com.smartdairy.production.mapper;

import com.smartdairy.production.dto.ProductionBatchItemResponse;
import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.entity.ProductionBatch;
import com.smartdairy.production.entity.ProductionBatchItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductionBatchMapper {

    ProductionBatchResponse toResponse(
            ProductionBatch entity);

    @Mapping(target = "productUuid", source = "product.uuid")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "productName", source = "product.productName")
    ProductionBatchItemResponse toResponse(
            ProductionBatchItem entity);
}