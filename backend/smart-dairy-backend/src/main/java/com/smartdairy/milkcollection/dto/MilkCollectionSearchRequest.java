package com.smartdairy.milkcollection.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class MilkCollectionSearchRequest {

    private UUID branchUuid;

    private UUID farmerUuid;

    private UUID shiftUuid;

    private UUID milkTypeUuid;

    private UUID collectionMethodUuid;

    private Boolean locked;

    private LocalDate fromDate;

    private LocalDate toDate;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

}