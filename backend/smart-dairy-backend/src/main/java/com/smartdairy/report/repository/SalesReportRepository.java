package com.smartdairy.report.repository;

import com.smartdairy.report.dto.*;

import java.util.List;

public interface SalesReportRepository {

    SalesSummaryReportResponse getSalesSummary(SalesSummaryReportRequest request);
    List<CustomerSalesReportResponse> getCustomerSales(CustomerSalesReportRequest request);
    List<ProductSalesReportResponse> getProductSales(ProductSalesReportRequest request);
}