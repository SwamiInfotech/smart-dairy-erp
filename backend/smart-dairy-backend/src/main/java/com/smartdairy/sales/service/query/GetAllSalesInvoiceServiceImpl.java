package com.smartdairy.sales.service.query;

import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.dto.SalesInvoiceSearchRequest;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import com.smartdairy.sales.specification.SalesInvoiceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetAllSalesInvoiceServiceImpl
        implements GetAllSalesInvoiceService {

    private final SalesInvoiceRepository repository;

    private final SalesInvoiceMapper mapper;

    @Override
    public Page<SalesInvoiceResponse> search(
            SalesInvoiceSearchRequest request,
            Pageable pageable) {

        return repository.findAll(
                        SalesInvoiceSpecification.search(request),
                        pageable)
                .map(mapper::toResponse);

    }

}