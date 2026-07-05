package com.smartdairy.company.mapper;

import com.smartdairy.company.dto.CompanyResponse;
import com.smartdairy.company.dto.CreateCompanyRequest;
import com.smartdairy.company.entity.Company;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    Company toEntity(CreateCompanyRequest request);

    CompanyResponse toResponse(Company company);

}