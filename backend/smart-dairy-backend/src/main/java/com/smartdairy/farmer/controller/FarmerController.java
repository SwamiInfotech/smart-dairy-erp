package com.smartdairy.farmer.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.farmer.dto.CreateFarmerRequest;
import com.smartdairy.farmer.dto.FarmerResponse;
import com.smartdairy.farmer.service.CreateFarmerService;
import com.smartdairy.farmer.service.DeleteFarmerService;
import com.smartdairy.farmer.service.GetAllFarmerList;
import com.smartdairy.farmer.service.GetFarmerByUuidService;
import com.smartdairy.farmer.service.UpdateFarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final CreateFarmerService createFarmerService;
    private final GetAllFarmerList getAllFarmerList;
    private final GetFarmerByUuidService getFarmerByUuidService;
    private final UpdateFarmerService updateFarmerService;
    private final DeleteFarmerService deleteFarmerService;

    @PostMapping
    public ResponseEntity<ApiResponse<FarmerResponse>> create(
            @Valid @RequestBody CreateFarmerRequest request) {
        log.info("Received request to create farmer.");

        FarmerResponse response = createFarmerService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Farmer created successfully.", response));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<FarmerResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch farmer with uuid={}.", uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Farmer retrieved successfully.",
                        getFarmerByUuidService.get(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> getAllFarmers() {
        log.info("Received request to fetch all farmers.");

        List<FarmerResponse> response = getAllFarmerList.getAllFarmers();

        return ResponseEntity.ok(ApiResponse.success("Farmers retrieved successfully.", response));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<FarmerResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody CreateFarmerRequest request) {
        log.info("Received request to update farmer with uuid={}.", uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Farmer updated successfully.",
                        updateFarmerService.update(uuid, request)));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {
        log.info("Received request to delete farmer with uuid={}.", uuid);

        deleteFarmerService.delete(uuid);

        return ResponseEntity.ok(ApiResponse.success("Farmer deleted successfully.", null));
    }
}