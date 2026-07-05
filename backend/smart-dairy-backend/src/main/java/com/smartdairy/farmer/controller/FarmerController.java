package com.smartdairy.farmer.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.service.CreateFarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final CreateFarmerService createFarmerService;

    @PostMapping
    public ResponseEntity<ApiResponse<FarmerResponse>> create(
            @Valid @RequestBody CreateFarmerRequest request) {

        FarmerResponse response = createFarmerService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Farmer created successfully.",
                        response
                ));
    }
}