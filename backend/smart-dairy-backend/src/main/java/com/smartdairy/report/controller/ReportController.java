package com.smartdairy.report.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.report.dto.*;
import com.smartdairy.report.service.GetCustomerSalesReportService;
import com.smartdairy.report.service.GetProductSalesReportService;
import com.smartdairy.report.service.GetSalesSummaryReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final GetSalesSummaryReportService service;
    private final GetCustomerSalesReportService getCustomerSalesReportService;
    private final GetProductSalesReportService getProductSalesReportService;


    @PostMapping("/sales-summary")
    public ResponseEntity<ApiResponse<SalesSummaryReportResponse>> salesSummary(
            @RequestBody SalesSummaryReportRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales summary generated successfully.",
                        service.getReport(request)));

    }

    @PostMapping("/customer-sales")
    public ResponseEntity<ApiResponse<List<CustomerSalesReportResponse>>> customerSales(
            @RequestBody CustomerSalesReportRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer sales report generated successfully.",
                        getCustomerSalesReportService.getReport(request)));

    }

    @PostMapping("/product-sales")
    public ResponseEntity<ApiResponse<List<ProductSalesReportResponse>>> productSales(
            @RequestBody ProductSalesReportRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product sales report generated successfully.",
                        getProductSalesReportService.getReport(request)));

    }

}