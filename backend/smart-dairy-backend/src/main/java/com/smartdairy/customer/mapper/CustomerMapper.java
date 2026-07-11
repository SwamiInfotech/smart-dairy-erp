package com.smartdairy.customer.mapper;

import com.smartdairy.customer.dto.CustomerResponse;
import com.smartdairy.customer.entity.Customer;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "customerUuid", source = "customer.uuid")
    @Mapping(target = "customerCode", source = "customer.customerCode")
    @Mapping(target = "customerName", source = "customer.customerName")
    @Mapping(target = "customerMobile", source = "customer.mobileNo")
    SalesInvoiceResponse toResponse(SalesInvoice entity);

    CustomerResponse toResponse(Customer entity);
}