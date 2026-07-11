package com.smartdairy.report.service;

import com.smartdairy.report.dto.ProductSalesReportRequest;
import com.smartdairy.report.dto.ProductSalesReportResponse;
import com.smartdairy.report.repository.SalesReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetProductSalesReportServiceImpl
        implements GetProductSalesReportService {

    private final SalesReportRepository repository;

    @Override
    public List<ProductSalesReportResponse> getReport(
            ProductSalesReportRequest request) {

        return repository.getProductSales(request);

    }

}