package com.smartdairy.report.service;

import com.smartdairy.report.dto.CustomerSalesReportRequest;
import com.smartdairy.report.dto.CustomerSalesReportResponse;
import com.smartdairy.report.repository.SalesReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetCustomerSalesReportServiceImpl
        implements GetCustomerSalesReportService {

    private final SalesReportRepository repository;

    @Override
    public List<CustomerSalesReportResponse> getReport(
            CustomerSalesReportRequest request) {

        return repository.getCustomerSales(request);

    }

}