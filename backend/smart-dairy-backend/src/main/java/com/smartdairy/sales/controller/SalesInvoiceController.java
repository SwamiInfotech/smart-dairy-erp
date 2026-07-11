package com.smartdairy.sales.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.sales.dto.*;
import com.smartdairy.sales.service.command.CancelSalesInvoiceService;
import com.smartdairy.sales.service.command.CreateSalesInvoiceService;
import com.smartdairy.sales.service.command.UpdateSalesInvoiceService;
import com.smartdairy.sales.service.query.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SalesInvoiceController {

    private final CreateSalesInvoiceService createService;
    private final UpdateSalesInvoiceService updateService;
    private final CancelSalesInvoiceService cancelService;
    private final GetSalesInvoiceByUuidService getSalesInvoiceByUuidService;
    private final GetAllSalesInvoiceService getAllSalesInvoiceService;
    private final SalesDashboardService salesDashboardService;
    private final ProductSalesReportService productSalesReportService;
    private final CustomerSalesReportService customerSalesReportService;
    private final DailySalesReportService dailySalesReportService;
    private final MonthlySalesReportService monthlySalesReportService;

    @PostMapping
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> create(
            @Valid @RequestBody CreateSalesInvoiceRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Sales Invoice created successfully.",
                        createService.create(request)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateSalesInvoiceRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales Invoice updated successfully.",
                        updateService.update(uuid, request)));
    }

    @PatchMapping("/{uuid}/cancel")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> cancel(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales Invoice cancelled successfully.",
                        cancelService.cancel(uuid)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<SalesInvoiceResponse>> get(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales Invoice retrieved successfully.",
                        getSalesInvoiceByUuidService.get(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SalesInvoiceResponse>>> search(
            SalesInvoiceSearchRequest request,

            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "invoiceDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales Invoices retrieved successfully.",
                        getAllSalesInvoiceService.search(request, pageable)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SalesDashboardResponse>> dashboard(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sales Dashboard",
                        salesDashboardService.dashboard(
                                fromDate,
                                toDate)));

    }

    @GetMapping("/reports/product-wise")
    public ResponseEntity<ApiResponse<List<ProductSalesReportResponse>>> productWiseReport(@RequestParam LocalDate fromDate,
                                                                                           @RequestParam LocalDate toDate) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product Wise Sales Report",
                        productSalesReportService.report(fromDate,  toDate)));

    }

    @GetMapping("/reports/customer-wise")
    public ResponseEntity<ApiResponse<List<CustomerSalesReportResponse>>> customerWiseReport(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer Wise Sales Report",
                        customerSalesReportService.report( fromDate, toDate)));
    }


    @GetMapping("/reports/daily")
    public ResponseEntity<ApiResponse<List<DailySalesReportResponse>>> dailyReport(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Daily Sales Report",
                        dailySalesReportService.report( fromDate, toDate)));
    }

    @GetMapping("/reports/monthly")
    public ResponseEntity<ApiResponse<List<MonthlySalesReportResponse>>> monthlyReport() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Monthly Sales Report",
                        monthlySalesReportService.report()));

    }
}