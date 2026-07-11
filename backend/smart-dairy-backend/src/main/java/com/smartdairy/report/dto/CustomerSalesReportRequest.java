package com.smartdairy.report.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CustomerSalesReportRequest(

        UUID branchUuid,

        UUID customerUuid,

        LocalDate fromDate,

        LocalDate toDate

) {
}