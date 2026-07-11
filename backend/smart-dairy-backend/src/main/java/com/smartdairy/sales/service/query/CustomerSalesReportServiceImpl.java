package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.CustomerSalesReportResponse;
import com.smartdairy.sales.repository.CustomerSalesReportProjection;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerSalesReportServiceImpl implements CustomerSalesReportService {

    private final SalesInvoiceRepository repository;

    @Override
    public List<CustomerSalesReportResponse> report(
            LocalDate fromDate,
            LocalDate toDate) {

        return repository.customerSalesReport(fromDate, toDate)
                .stream()
                .map(this::map)
                .toList();
    }

    private CustomerSalesReportResponse map(CustomerSalesReportProjection projection) {
        return new CustomerSalesReportResponse(
                projection.getCustomerName(),
                projection.getCustomerMobile(),
                projection.getTotalInvoices(),
                projection.getTotalSales(),
                projection.getTotalDiscount(),
                projection.getNetSales());
    }
}