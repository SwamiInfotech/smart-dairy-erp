package com.smartdairy.report.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.report.dto.*;
import com.smartdairy.report.service.GetCustomerSalesReportService;
import com.smartdairy.report.service.GetProductSalesReportService;
import com.smartdairy.report.service.GetSalesSummaryReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final GetSalesSummaryReportService service;
    private final GetCustomerSalesReportService getCustomerSalesReportService;
    private final GetProductSalesReportService getProductSalesReportService;


    @PostMapping("/sales-summary")
    public ResponseEntity<ApiResponse<SalesSummaryReportResponse>> salesSummary(
            @RequestBody SalesSummaryReportRequest request) {
        log.info("Received request to generate sales summary report.");

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales summary generated successfully.",
                        service.getReport(request)));

    }

    @PostMapping("/customer-sales")
    public ResponseEntity<ApiResponse<List<CustomerSalesReportResponse>>> customerSales(
            @RequestBody CustomerSalesReportRequest request) {
        log.info("Received request to generate customer sales report.");

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer sales report generated successfully.",
                        getCustomerSalesReportService.getReport(request)));

    }

    @PostMapping("/product-sales")
    public ResponseEntity<ApiResponse<List<ProductSalesReportResponse>>> productSales(
            @RequestBody ProductSalesReportRequest request) {
        log.info("Received request to generate product sales report.");

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product sales report generated successfully.",
                        getProductSalesReportService.getReport(request)));

    }

}