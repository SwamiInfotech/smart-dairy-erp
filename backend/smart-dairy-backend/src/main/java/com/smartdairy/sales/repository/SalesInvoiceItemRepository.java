package com.smartdairy.sales.repository;

import com.smartdairy.sales.entity.SalesInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesInvoiceItemRepository
        extends JpaRepository<SalesInvoiceItem, Long> {

    List<SalesInvoiceItem> findBySalesInvoiceId(Long salesInvoiceId);

}