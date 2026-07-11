package com.smartdairy.sales.service.command;

import com.smartdairy.exception.BusinessException;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.sales.dto.SalesInvoiceResponse;
import com.smartdairy.sales.entity.SalesInvoice;
import com.smartdairy.sales.enums.SalesStatus;
import com.smartdairy.sales.mapper.SalesInvoiceMapper;
import com.smartdairy.sales.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LockSalesInvoiceServiceImpl
        implements LockSalesInvoiceService {

    private final SalesInvoiceRepository repository;

    private final SalesInvoiceMapper mapper;

    @Override
    public SalesInvoiceResponse lock(UUID uuid) {

        SalesInvoice invoice = repository.findByUuid(uuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sales Invoice not found."));

        if (Boolean.TRUE.equals(invoice.getLocked())) {

            throw new BusinessException(
                    "Sales Invoice already locked.");

        }

        if (invoice.getStatus() == SalesStatus.CANCELLED) {

            throw new BusinessException(
                    "Cancelled invoice cannot be locked.");

        }

        invoice.setLocked(Boolean.TRUE);

        invoice.setStatus(SalesStatus.LOCKED);

        return mapper.toResponse(repository.save(invoice));

    }

}