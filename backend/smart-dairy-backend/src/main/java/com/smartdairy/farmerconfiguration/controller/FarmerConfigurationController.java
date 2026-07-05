package com.smartdairy.farmerconfiguration.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.farmerconfiguration.dto.CreateFarmerConfigurationRequest;
import com.smartdairy.farmerconfiguration.dto.FarmerConfigurationResponse;
import com.smartdairy.farmerconfiguration.service.CreateFarmerConfigurationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farmer-configurations")
@RequiredArgsConstructor
public class FarmerConfigurationController {

    private final CreateFarmerConfigurationService service;

    @PostMapping
    public ResponseEntity<ApiResponse<FarmerConfigurationResponse>> create(
            @Valid @RequestBody CreateFarmerConfigurationRequest request) {

        FarmerConfigurationResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Farmer configuration created successfully.",
                        response
                ));
    }
}