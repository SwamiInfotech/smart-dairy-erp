package com.smartdairy.report.service;

import com.smartdairy.report.dto.CustomerSalesReportRequest;
import com.smartdairy.report.dto.CustomerSalesReportResponse;

import java.util.List;

public interface GetCustomerSalesReportService {

    List<CustomerSalesReportResponse> getReport(
            CustomerSalesReportRequest request);

}