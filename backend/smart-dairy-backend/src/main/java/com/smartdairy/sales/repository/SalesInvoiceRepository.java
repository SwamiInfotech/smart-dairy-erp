package com.smartdairy.sales.repository;

import com.smartdairy.sales.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long>, JpaSpecificationExecutor<SalesInvoice> {

    Optional<SalesInvoice> findByUuid(UUID uuid);

    Optional<SalesInvoice> findByInvoiceNo(String invoiceNo);

    boolean existsByInvoiceNo(String invoiceNo);

    long countByInvoiceNoStartingWith(String prefix);

    long countByInvoiceDate(LocalDate invoiceDate);

    @Query("""
            select
            count(s) as totalInvoices,
            coalesce(sum(s.totalAmount),0) as totalSales,
            coalesce(sum(s.discountAmount),0) as totalDiscount,
            coalesce(sum(s.netAmount),0) as netSales
            from SalesInvoice s
            where s.status='COMPLETED'
            and s.invoiceDate between :fromDate and :toDate
            """)
    SalesDashboardProjection getDashboard(LocalDate fromDate, LocalDate toDate);

    @Query("""
            select 
            p.uuid as productUuid,            
            p.productCode as productCode,            
            p.productName as productName,            
            sum(i.quantity) as quantitySold,            
            sum(i.lineTotal) as totalAmount            
            from SalesInvoice s            
            join s.items i            
            join i.product p            
            where s.status='COMPLETED'            
            and s.invoiceDate between :fromDate and :toDate            
            group by            
            p.uuid, p.productCode, p.productName            
            order by totalAmount desc
            
            """)
    List<ProductSalesReportProjection> productSalesReport(LocalDate fromDate, LocalDate toDate);

    @Query("""
            select
            
            s.customerName as customerName,
            
            s.customerMobile as customerMobile,
            
            count(s.id) as totalInvoices,
            
            sum(s.totalAmount) as totalSales,
            
            sum(s.discountAmount) as totalDiscount,
            
            sum(s.netAmount) as netSales
            
            from SalesInvoice s
            
            where s.status='COMPLETED'
            
            and s.invoiceDate between :fromDate and :toDate
            
            group by
            
            s.customerName,
            
            s.customerMobile
            
            order by netSales desc
            
            """)
    List<CustomerSalesReportProjection> customerSalesReport(LocalDate fromDate, LocalDate toDate);

    @Query("""
            select
            
            s.invoiceDate as salesDate,
            
            count(s.id) as totalInvoices,
            
            sum(s.totalAmount) as totalSales,
            
            sum(s.discountAmount) as totalDiscount,
            
            sum(s.netAmount) as netSales
            
            from SalesInvoice s
            
            where s.status='COMPLETED'
            
            and s.invoiceDate between :fromDate and :toDate
            
            group by s.invoiceDate
            
            order by s.invoiceDate
            
            """)
    List<DailySalesReportProjection> dailySalesReport(LocalDate fromDate, LocalDate toDate);

    @Query("""
            select
            
            YEAR(s.invoiceDate) as year,
            
            MONTH(s.invoiceDate) as month,
            
            count(s.id) as totalInvoices,
            
            coalesce(sum(s.totalAmount),0) as totalSales,
            
            coalesce(sum(s.discountAmount),0) as totalDiscount,
            
            coalesce(sum(s.netAmount),0) as netSales
            
            from SalesInvoice s
            
            where s.status='COMPLETED'
            
            group by
            
            YEAR(s.invoiceDate),
            
            MONTH(s.invoiceDate)
            
            order by
            
            YEAR(s.invoiceDate) desc,
            
            MONTH(s.invoiceDate) desc
            
            """)
    List<MonthlySalesReportProjection> monthlySalesReport();

}