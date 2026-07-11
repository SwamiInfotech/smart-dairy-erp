package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.CustomerSalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface CustomerSalesReportService {

    List<CustomerSalesReportResponse> report(
            LocalDate fromDate,
            LocalDate toDate);

}