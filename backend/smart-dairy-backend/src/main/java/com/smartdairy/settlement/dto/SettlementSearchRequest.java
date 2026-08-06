package com.smartdairy.settlement.dto;

import com.smartdairy.settlement.enums.SettlementStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SettlementSearchRequest {

    private UUID farmerUuid;

    private SettlementStatus status;

    private LocalDate fromDate;

    private LocalDate toDate;

}