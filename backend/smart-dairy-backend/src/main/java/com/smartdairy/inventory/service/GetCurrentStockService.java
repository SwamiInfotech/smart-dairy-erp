package com.smartdairy.inventory.service;

import com.smartdairy.inventory.dto.CurrentStockResponse;

import java.util.UUID;

public interface GetCurrentStockService {

    CurrentStockResponse getCurrentStock(UUID productUuid);

}