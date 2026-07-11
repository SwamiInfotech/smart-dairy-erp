package com.smartdairy.report.service;

import com.smartdairy.report.dto.ProductSalesReportRequest;
import com.smartdairy.report.dto.ProductSalesReportResponse;

import java.util.List;

public interface GetProductSalesReportService {

    List<ProductSalesReportResponse> getReport(
            ProductSalesReportRequest request);

}