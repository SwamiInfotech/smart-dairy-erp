package com.smartdairy.shift.mapper;

import com.smartdairy.shift.dto.ShiftResponse;
import com.smartdairy.shift.entity.Shift;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ShiftMapper {

    ShiftResponse toResponse(Shift entity);

}
