package com.smartdairy.loan.mapper;

import com.smartdairy.loan.dto.CreateLoanRequest;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.entity.Loan;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public abstract class LoanMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)

    @Mapping(target = "loanNo", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "farmer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "active", ignore = true)

    public abstract Loan toEntity(CreateLoanRequest request);

    @AfterMapping
    protected void afterMapping(@MappingTarget Loan entity){

        entity.setStatus(com.smartdairy.loan.enums.LoanStatus.PENDING);

        entity.setActive(true);
    }

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")
    public abstract LoanResponse toResponse(Loan entity);

}