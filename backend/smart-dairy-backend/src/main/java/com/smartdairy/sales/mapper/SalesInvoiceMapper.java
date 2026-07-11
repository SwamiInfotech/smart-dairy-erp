package com.smartdairy.sales.mapper;

import com.smartdairy.sales.dto.SalesInvoiceItemResponse;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.entity.SalesInvoiceItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SalesInvoiceMapper {

    SalesInvoiceResponse toResponse(SalesInvoice entity);

    List<SalesInvoiceResponse> toResponse(List<SalesInvoice> entities);

    @Mapping(target = "productUuid", source = "product.uuid")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "productName", source = "product.productName")
    SalesInvoiceItemResponse toResponse(SalesInvoiceItem entity);

    List<SalesInvoiceItemResponse> toItemResponse(List<SalesInvoiceItem> entities);
}