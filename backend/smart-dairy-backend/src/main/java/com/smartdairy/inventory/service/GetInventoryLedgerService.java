package com.smartdairy.inventory.service;

import com.smartdairy.inventory.dto.InventoryLedgerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GetInventoryLedgerService {

    Page<InventoryLedgerResponse> getLedger(
            UUID productUuid,
            Pageable pageable);

}