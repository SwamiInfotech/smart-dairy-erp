package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.MonthlySalesReportResponse;
import com.smartdairy.sales.repository.MonthlySalesReportProjection;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MonthlySalesReportServiceImpl
        implements MonthlySalesReportService {

    private final SalesInvoiceRepository repository;

    @Override
    public List<MonthlySalesReportResponse> report() {

        return repository.monthlySalesReport()
                .stream()
                .map(this::map)
                .toList();

    }

    private MonthlySalesReportResponse map(
            MonthlySalesReportProjection projection) {

        return new MonthlySalesReportResponse(

                projection.getYear(),

                projection.getMonth(),

                projection.getTotalInvoices(),

                projection.getTotalSales(),

                projection.getTotalDiscount(),

                projection.getNetSales());

    }

}