package com.smartdairy.inventory.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.inventory.dto.CurrentStockResponse;
import com.smartdairy.inventory.service.GetCurrentStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final GetCurrentStockService getCurrentStockService;

    @GetMapping("/current-stock/{productUuid}")
    public ResponseEntity<ApiResponse<CurrentStockResponse>> getCurrentStock(
            @PathVariable UUID productUuid) {
        log.info("Received request to fetch current stock for product uuid={}.", productUuid);

        return ResponseEntity.ok(ApiResponse.success(
                "Current stock fetched successfully.",
                getCurrentStockService.getCurrentStock(productUuid)));
    }

    @GetMapping({"", "/", "/current-stock"})
    public ResponseEntity<ApiResponse<List<CurrentStockResponse>>> getCurrentStockForAllProducts() {
        log.info("Received request to fetch current stock for all products.");

        return ResponseEntity.ok(ApiResponse.success(
                "Current stock for all products fetched successfully.",
                getCurrentStockService.getCurrentStockForAllProducts()));
    }
}
