package com.smartdairy.production.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProductionBatchResponse(

        UUID uuid,

        String batchNo,

        LocalDate productionDate,

        String remarks,

        List<ProductionBatchItemResponse> items

) {
}