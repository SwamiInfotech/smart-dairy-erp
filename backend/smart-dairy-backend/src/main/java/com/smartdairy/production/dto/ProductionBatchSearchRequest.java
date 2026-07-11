package com.smartdairy.production.dto;

import com.smartdairy.production.enums.ProductionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProductionBatchSearchRequest {

    private String batchNo;

    private LocalDate fromDate;

    private LocalDate toDate;

    private ProductionStatus status;

}