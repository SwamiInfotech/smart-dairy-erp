package com.smartdairy.report.service;

import com.smartdairy.report.dto.SalesSummaryReportRequest;
import com.smartdairy.report.dto.SalesSummaryReportResponse;
import com.smartdairy.report.repository.SalesReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetSalesSummaryReportServiceImpl
        implements GetSalesSummaryReportService {

    private final SalesReportRepository repository;

    @Override
    public SalesSummaryReportResponse getReport(
            SalesSummaryReportRequest request) {

        return repository.getSalesSummary(request);

    }

}