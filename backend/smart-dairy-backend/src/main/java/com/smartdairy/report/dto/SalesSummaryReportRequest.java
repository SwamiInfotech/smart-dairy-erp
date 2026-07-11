package com.smartdairy.report.dto;

import java.time.LocalDate;
import java.util.UUID;

public record SalesSummaryReportRequest(

        UUID branchUuid,

        LocalDate fromDate,

        LocalDate toDate

) {
}