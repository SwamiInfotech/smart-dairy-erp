package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.ProductSalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ProductSalesReportService {

    List<ProductSalesReportResponse> report(LocalDate fromDate, LocalDate toDate);

}