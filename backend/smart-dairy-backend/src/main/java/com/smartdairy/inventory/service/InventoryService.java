package com.smartdairy.inventory.service;

import com.smartdairy.inventory.dto.InventoryTransactionRequest;

import java.math.BigDecimal;
import java.util.UUID;

public interface InventoryService {

    void createTransaction(InventoryTransactionRequest request);

    BigDecimal getCurrentStock(UUID productUuid);

}