package com.smartdairy.customer.mapper;

import com.smartdairy.customer.dto.CustomerLedgerResponse;
import com.smartdairy.customer.dto.CustomerStatementResponse;
import com.smartdairy.customer.entity.CustomerLedger;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerLedgerMapper {

    @Mapping(target = "referenceType", source = "referenceType")
    CustomerLedgerResponse toResponse(CustomerLedger entity);

    List<CustomerLedgerResponse> toResponse(List<CustomerLedger> entities);

    CustomerStatementResponse toStatement(CustomerLedger entity);

}