package com.smartdairy.product.mapper;

import com.smartdairy.product.dto.CreateProductRequest;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.UpdateProductRequest;
import com.smartdairy.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "active", ignore = true)
    Product toEntity(CreateProductRequest request);

    ProductResponse toResponse(Product entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(UpdateProductRequest request,
                      @org.mapstruct.MappingTarget Product entity);
}