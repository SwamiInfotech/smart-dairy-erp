package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.DailySalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface DailySalesReportService {

    List<DailySalesReportResponse> report(
            LocalDate fromDate,
            LocalDate toDate);

}