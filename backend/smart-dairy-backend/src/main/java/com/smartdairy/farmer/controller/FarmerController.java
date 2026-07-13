package com.smartdairy.farmer.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.service.CreateFarmerService;
import com.smartdairy.farmer.service.GetAllFarmerList;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final CreateFarmerService createFarmerService;
    private final GetAllFarmerList getAllFarmerList;

    @PostMapping
    public ResponseEntity<ApiResponse<FarmerResponse>> create(
            @Valid @RequestBody CreateFarmerRequest request) {

        FarmerResponse response = createFarmerService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Farmer created successfully.",
                        response,
                        LocalDateTime.now()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> getAllFarmers() {

        List<FarmerResponse> response = getAllFarmerList.getAllFarmers();

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Farmers retrieved successfully.",
                        response,
                        LocalDateTime.now()));
    }
}