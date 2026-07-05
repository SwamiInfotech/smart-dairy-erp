package com.smartdairy.master.mapper;

import com.smartdairy.master.dto.MilkTypeResponse;
import com.smartdairy.master.entity.MilkType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MilkTypeMapper {

    MilkTypeResponse toResponse(MilkType entity);

}