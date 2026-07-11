package com.smartdairy.inventory.service.impl;

import com.smartdairy.inventory.dto.InventoryLedgerResponse;
import com.smartdairy.inventory.mapper.InventoryMapper;
import com.smartdairy.inventory.repository.InventoryTransactionRepository;
import com.smartdairy.inventory.service.GetInventoryLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetInventoryLedgerServiceImpl
        implements GetInventoryLedgerService {

    private final InventoryTransactionRepository repository;

    private final InventoryMapper mapper;

    @Override
    public Page<InventoryLedgerResponse> getLedger(
            UUID productUuid,
            Pageable pageable) {

        return repository.findByProductUuid(
                        productUuid,
                        pageable)
                .map(mapper::toLedgerResponse);
    }
}