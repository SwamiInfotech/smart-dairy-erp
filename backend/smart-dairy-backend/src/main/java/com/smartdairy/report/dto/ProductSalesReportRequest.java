package com.smartdairy.report.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ProductSalesReportRequest(

        UUID branchUuid,

        UUID productUuid,

        LocalDate fromDate,

        LocalDate toDate

) {
}