package com.smartdairy.paymentcycle.mapper;

import com.smartdairy.paymentcycle.dto.CreatePaymentCycleRequest;
import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.dto.UpdatePaymentCycleRequest;
import com.smartdairy.paymentcycle.entity.PaymentCycle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentCycleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    PaymentCycle toEntity(CreatePaymentCycleRequest request);

    PaymentCycleResponse toResponse(PaymentCycle entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tenantUuid", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(UpdatePaymentCycleRequest request, @MappingTarget PaymentCycle entity);
}
