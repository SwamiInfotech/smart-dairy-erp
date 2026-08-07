package com.smartdairy.configuration.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.configuration.dto.CreateSmartDairyConfigurationRequest;
import com.smartdairy.configuration.dto.SmartDairyConfigurationResponse;
import com.smartdairy.configuration.dto.UpdateSmartDairyConfigurationRequest;
import com.smartdairy.configuration.service.SmartDairyConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/smart-dairy-configuration")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Smart Dairy Configuration", description = "APIs for managing Smart Dairy Configuration")
public class SmartDairyConfigurationController {

    private final SmartDairyConfigurationService service;

    @PostMapping
    @Operation(summary = "Create new Smart Dairy Configuration")
    public ResponseEntity<ApiResponse<SmartDairyConfigurationResponse>> create(
            @Valid @RequestBody CreateSmartDairyConfigurationRequest request) {
        log.info("Received request to create Smart Dairy Configuration");

        SmartDairyConfigurationResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Smart Dairy Configuration created successfully",
                        response,
                        LocalDateTime.now()));
    }

    @GetMapping("/{uuid}")
    @Operation(summary = "Get Smart Dairy Configuration by UUID")
    public ResponseEntity<ApiResponse<SmartDairyConfigurationResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch Smart Dairy Configuration by UUID: {}", uuid);

        SmartDairyConfigurationResponse response = service.getByUuid(uuid);

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Smart Dairy Configuration retrieved successfully",
                response,
                LocalDateTime.now()));
    }

    @GetMapping("/current/tenant")
    @Operation(summary = "Get Smart Dairy Configuration for current tenant")
    public ResponseEntity<ApiResponse<SmartDairyConfigurationResponse>> getCurrentTenantConfiguration() {
        log.info("Received request to fetch Smart Dairy Configuration for current tenant");

        SmartDairyConfigurationResponse response = service.getCurrentTenantConfiguration();

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Smart Dairy Configuration retrieved successfully",
                response,
                LocalDateTime.now()));
    }

    @PutMapping("/{uuid}")
    @Operation(summary = "Update Smart Dairy Configuration")
    public ResponseEntity<ApiResponse<SmartDairyConfigurationResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateSmartDairyConfigurationRequest request) {
        log.info("Received request to update Smart Dairy Configuration with UUID: {}", uuid);

        SmartDairyConfigurationResponse response = service.update(uuid, request);

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Smart Dairy Configuration updated successfully",
                response,
                LocalDateTime.now()));
    }

    @DeleteMapping("/{uuid}")
    @Operation(summary = "Delete Smart Dairy Configuration")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID uuid) {
        log.info("Received request to delete Smart Dairy Configuration with UUID: {}", uuid);

        service.delete(uuid);

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Smart Dairy Configuration deleted successfully",
                null,
                LocalDateTime.now()));
    }
}
