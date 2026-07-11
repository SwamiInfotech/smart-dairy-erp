package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.dto.SalesInvoiceSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchSalesInvoiceService {

    Page<SalesInvoiceResponse> search(
            SalesInvoiceSearchRequest request,
            Pageable pageable);

}