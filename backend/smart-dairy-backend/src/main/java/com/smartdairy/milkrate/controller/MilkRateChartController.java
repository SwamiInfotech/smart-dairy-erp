package com.smartdairy.milkrate.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.milkrate.dto.CreateMilkRateChartRequest;
import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.service.CreateMilkRateChartService;
import com.smartdairy.milkrate.service.GetMilkRateChartByUuidService;
import com.smartdairy.milkrate.service.GetMilkRateChartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/milk-rate-charts"})
@RequiredArgsConstructor
@Slf4j
public class MilkRateChartController {

    private final CreateMilkRateChartService service;
    private final GetMilkRateChartService getMilkRateChartService;
    private final GetMilkRateChartByUuidService getMilkRateChartByUuidService;

    @PostMapping
    public ResponseEntity<ApiResponse<MilkRateChartResponse>> create(
            @Valid @RequestBody CreateMilkRateChartRequest request) {
        log.info("Received request to create milk rate chart.");

        MilkRateChartResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Milk Rate Chart created successfully.",
                        response,
                        LocalDateTime.now()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MilkRateChartResponse>>> getAll() {
        log.info("Received request to fetch all milk rate charts.");

        List<MilkRateChartResponse> response = getMilkRateChartService.getAll();

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Milk Rate Charts retrieved successfully.",
                        response,
                        LocalDateTime.now()));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<MilkRateChartResponse>> getByUuid(@PathVariable UUID uuid) {
        log.info("Received request to fetch milk rate chart with uuid={}.", uuid);

        MilkRateChartResponse response = getMilkRateChartByUuidService.getByUuid(uuid);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Milk Rate Chart retrieved successfully.",
                        response,
                        LocalDateTime.now()));
    }
}