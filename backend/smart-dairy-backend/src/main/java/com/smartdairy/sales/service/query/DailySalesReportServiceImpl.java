package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.DailySalesReportResponse;
import com.smartdairy.sales.repository.DailySalesReportProjection;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailySalesReportServiceImpl implements DailySalesReportService {

    private final SalesInvoiceRepository repository;

    @Override
    public List<DailySalesReportResponse> report(
            LocalDate fromDate,
            LocalDate toDate) {

        return repository.dailySalesReport(fromDate, toDate)
                .stream()
                .map(this::map)
                .toList();
    }

    private DailySalesReportResponse map(
            DailySalesReportProjection projection) {

        return new DailySalesReportResponse(

                projection.getSalesDate(),

                projection.getTotalInvoices(),

                projection.getTotalSales(),

                projection.getTotalDiscount(),

                projection.getNetSales());

    }

}