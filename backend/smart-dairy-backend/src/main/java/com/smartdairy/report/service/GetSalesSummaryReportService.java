package com.smartdairy.report.service;

import com.smartdairy.report.dto.SalesSummaryReportRequest;
import com.smartdairy.report.dto.SalesSummaryReportResponse;

public interface GetSalesSummaryReportService {

    SalesSummaryReportResponse getReport(
            SalesSummaryReportRequest request);

}