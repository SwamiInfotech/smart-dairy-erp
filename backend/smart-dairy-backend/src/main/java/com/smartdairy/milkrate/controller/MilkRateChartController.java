package com.smartdairy.milkrate.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.milkrate.dto.CreateMilkRateChartRequest;
import com.smartdairy.milkrate.dto.MilkRateChartResponse;
import com.smartdairy.milkrate.service.CreateMilkRateChartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/milk-rate-charts")
@RequiredArgsConstructor
public class MilkRateChartController {

    private final CreateMilkRateChartService service;

    @PostMapping
    public ResponseEntity<ApiResponse<MilkRateChartResponse>> create(
            @Valid @RequestBody CreateMilkRateChartRequest request) {

        MilkRateChartResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Milk Rate Chart created successfully.",
                        response,
                        LocalDateTime.now()));
    }
}