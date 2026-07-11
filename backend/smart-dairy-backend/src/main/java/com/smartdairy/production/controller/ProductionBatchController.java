package com.smartdairy.production.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.production.dto.CreateProductionBatchRequest;
import com.smartdairy.production.dto.ProductionBatchResponse;
import com.smartdairy.production.dto.ProductionBatchSearchRequest;
import com.smartdairy.production.service.command.CreateProductionBatchCommandService;
import com.smartdairy.production.service.query.GetProductionBatchService;
import com.smartdairy.production.service.query.SearchProductionBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/production-batches")
@RequiredArgsConstructor
public class ProductionBatchController {

    private final CreateProductionBatchCommandService createService;

    private final GetProductionBatchService getService;

    private final SearchProductionBatchService searchService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductionBatchResponse>> create(
            @Valid @RequestBody CreateProductionBatchRequest request) {

        ProductionBatchResponse response = createService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Production Batch created successfully.",
                        response));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<ProductionBatchResponse>> get(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Production Batch retrieved successfully.",
                        getService.get(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductionBatchResponse>>> search(
            ProductionBatchSearchRequest request,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "productionDate",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Production Batches retrieved successfully.",
                        searchService.search(request, pageable)));
    }

}