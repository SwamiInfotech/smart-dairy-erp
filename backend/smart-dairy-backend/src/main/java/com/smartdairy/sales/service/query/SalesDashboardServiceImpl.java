package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesDashboardResponse;
import com.smartdairy.sales.repository.SalesDashboardProjection;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesDashboardServiceImpl
        implements SalesDashboardService {

    private final SalesInvoiceRepository repository;

    @Override
    public SalesDashboardResponse dashboard(
            LocalDate fromDate,
            LocalDate toDate) {

        SalesDashboardProjection summary =
                repository.getDashboard(
                        fromDate,
                        toDate);

        BigDecimal average =
                BigDecimal.ZERO;

        if (summary.getTotalInvoices() != null &&
                summary.getTotalInvoices() > 0) {

            average = summary.getNetSales()
                    .divide(
                            BigDecimal.valueOf(
                                    summary.getTotalInvoices()),
                            2,
                            RoundingMode.HALF_UP);

        }

        return new SalesDashboardResponse(

                summary.getTotalInvoices(),

                summary.getTotalSales(),

                summary.getTotalDiscount(),

                summary.getNetSales(),

                average

        );

    }

}