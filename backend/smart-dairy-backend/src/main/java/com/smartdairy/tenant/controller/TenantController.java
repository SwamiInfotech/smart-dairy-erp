package com.smartdairy.tenant.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.tenant.dto.CreateTenantRequest;
import com.smartdairy.tenant.dto.TenantResponse;
import com.smartdairy.tenant.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<ApiResponse<TenantResponse>> create(@Valid @RequestBody CreateTenantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tenant created successfully.", tenantService.create(request)));
    }

    @GetMapping
    public ApiResponse<List<TenantResponse>> getAll() {
        return ApiResponse.success("Tenants fetched successfully.", tenantService.getAll());
    }

    @GetMapping("/{tenantUuid}")
    public ApiResponse<TenantResponse> getByUuid(@PathVariable UUID tenantUuid) {
        return ApiResponse.success("Tenant fetched successfully.", tenantService.getByUuid(tenantUuid));
    }
}