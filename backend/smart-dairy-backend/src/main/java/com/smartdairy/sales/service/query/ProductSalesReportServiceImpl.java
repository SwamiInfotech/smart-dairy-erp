package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.ProductSalesReportResponse;
import com.smartdairy.sales.repository.ProductSalesReportProjection;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductSalesReportServiceImpl
        implements ProductSalesReportService {

    private final SalesInvoiceRepository repository;

    @Override
    public List<ProductSalesReportResponse> report(LocalDate fromDate, LocalDate toDate) {
        return repository.productSalesReport(
                        fromDate,
                        toDate)
                .stream()
                .map(this::map)
                .toList();

    }

    private ProductSalesReportResponse map(
            ProductSalesReportProjection p) {

        return new ProductSalesReportResponse(
                p.getProductUuid(),
                p.getProductCode(),
                p.getProductName(),
                p.getQuantitySold(),
                p.getTotalAmount());
    }

}