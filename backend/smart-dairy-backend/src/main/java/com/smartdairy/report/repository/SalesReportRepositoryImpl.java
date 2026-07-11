package com.smartdairy.report.repository;

import com.smartdairy.report.dto.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class SalesReportRepositoryImpl implements SalesReportRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public SalesSummaryReportResponse getSalesSummary(
            SalesSummaryReportRequest request) {

        Object[] row = (Object[]) entityManager.createQuery("""
                        
                        SELECT
                        
                            COUNT(s),
                        
                            COALESCE(SUM(s.totalAmount),0),
                        
                            COALESCE(SUM(s.discountAmount),0),
                        
                            COALESCE(SUM(s.netAmount),0),
                        
                            COALESCE(AVG(s.netAmount),0)
                        
                        FROM SalesInvoice s
                        
                        WHERE
                        
                            (:branchUuid IS NULL OR s.branch.uuid = :branchUuid)
                        
                        AND
                        
                            s.invoiceDate BETWEEN :fromDate AND :toDate
                        
                        """)
                .setParameter("branchUuid", request.branchUuid())
                .setParameter("fromDate", request.fromDate())
                .setParameter("toDate", request.toDate())
                .getSingleResult();

        return new SalesSummaryReportResponse(

                toLong(row[0]),

                toBigDecimal(row[1]),

                toBigDecimal(row[2]),

                toBigDecimal(row[3]),

                toBigDecimal(row[4]));

    }

    private Long toLong(Object value) {

        if (value instanceof Number number) {
            return number.longValue();
        }

        throw new IllegalStateException(
                "Expected numeric value for Long conversion but got: "
                        + (value == null ? "null" : value.getClass().getName()));
    }

    private BigDecimal toBigDecimal(Object value) {

        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }

        throw new IllegalStateException(
                "Expected numeric value for BigDecimal conversion but got: "
                        + (value == null ? "null" : value.getClass().getName()));
    }


    @Override
    public List<CustomerSalesReportResponse> getCustomerSales(
            CustomerSalesReportRequest request) {

        return entityManager.createQuery("""
                        
                        SELECT new com.smartdairy.report.dto.CustomerSalesReportResponse(
                        
                            c.uuid,
                        
                            c.customerCode,
                        
                            c.customerName,
                        
                            COUNT(s),
                        
                            COALESCE(SUM(i.quantity),0),
                        
                            COALESCE(SUM(s.totalAmount),0),
                        
                            COALESCE(SUM(s.discountAmount),0),
                        
                            COALESCE(SUM(s.netAmount),0)
                        
                        )
                        
                        FROM SalesInvoice s
                        
                        JOIN s.customer c
                        
                        JOIN s.items i
                        
                        WHERE
                        
                            (:branchUuid IS NULL OR s.branch.uuid=:branchUuid)
                        
                        AND
                        
                            (:customerUuid IS NULL OR c.uuid=:customerUuid)
                        
                        AND
                        
                            s.invoiceDate BETWEEN :fromDate AND :toDate
                        
                        GROUP BY
                        
                            c.uuid,
                            c.customerCode,
                            c.customerName
                        
                        ORDER BY
                        
                            c.customerName
                        
                        """, CustomerSalesReportResponse.class)

                .setParameter("branchUuid", request.branchUuid())
                .setParameter("customerUuid", request.customerUuid())
                .setParameter("fromDate", request.fromDate())
                .setParameter("toDate", request.toDate())
                .getResultList();

    }

    @Override
    public List<ProductSalesReportResponse> getProductSales(
            ProductSalesReportRequest request) {

        return entityManager.createQuery("""
                        
                        SELECT new com.smartdairy.report.dto.ProductSalesReportResponse(
                        
                            p.uuid,
                        
                            p.productCode,
                        
                            p.productName,
                        
                            COALESCE(SUM(i.quantity),0),
                        
                            COALESCE(SUM(i.lineTotal),0),
                        
                            COALESCE(AVG(i.unitPrice),0)
                        
                        )
                        
                        FROM SalesInvoice s
                        
                        JOIN s.items i
                        
                        JOIN i.product p
                        
                        WHERE
                        
                            (:branchUuid IS NULL OR s.branch.uuid = :branchUuid)
                        
                        AND
                        
                            (:productUuid IS NULL OR p.uuid = :productUuid)
                        
                        AND
                        
                            s.invoiceDate BETWEEN :fromDate AND :toDate
                        
                        GROUP BY
                        
                            p.uuid,
                            p.productCode,
                            p.productName
                        
                        ORDER BY
                        
                            p.productName
                        
                        """, ProductSalesReportResponse.class)

                .setParameter("branchUuid", request.branchUuid())
                .setParameter("productUuid", request.productUuid())
                .setParameter("fromDate", request.fromDate())
                .setParameter("toDate", request.toDate())
                .getResultList();

    }
}