package com.smartdairy.payment.mapper;

import com.smartdairy.payment.dto.CreatePaymentRequest;
import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uuid", ignore = true)
    @Mapping(target = "version", ignore = true)

    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "farmer", ignore = true)
    @Mapping(target = "settlement", ignore = true)

    @Mapping(target = "paymentNo", ignore = true)
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "active", ignore = true)
    Payment toEntity(CreatePaymentRequest request);

    @Mapping(target = "settlementUuid", source = "settlement.uuid")
    @Mapping(target = "settlementNo", source = "settlement.settlementNo")

    @Mapping(target = "farmerUuid", source = "farmer.uuid")
    @Mapping(target = "farmerCode", source = "farmer.farmerCode")
    @Mapping(target = "farmerName", source = "farmer.farmerName")
    PaymentResponse toResponse(Payment payment);
}