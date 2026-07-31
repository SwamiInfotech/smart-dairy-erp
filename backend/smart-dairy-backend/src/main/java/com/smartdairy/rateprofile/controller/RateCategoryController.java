package com.smartdairy.rateprofile.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.rateprofile.dto.CreateRateCategoryRequest;
import com.smartdairy.rateprofile.dto.RateCategoryResponse;
import com.smartdairy.rateprofile.dto.UpdateRateCategoryRequest;
import com.smartdairy.rateprofile.service.CreateRateCategoryService;
import com.smartdairy.rateprofile.service.DeleteRateCategoryService;
import com.smartdairy.rateprofile.service.GetRateCategoryByUuidService;
import com.smartdairy.rateprofile.service.GetRateCategoryService;
import com.smartdairy.rateprofile.service.UpdateRateCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/master/rate-categories")
public class RateCategoryController {

    private final CreateRateCategoryService createService;
    private final GetRateCategoryService getAllService;
    private final GetRateCategoryByUuidService getByUuidService;
    private final UpdateRateCategoryService updateService;
    private final DeleteRateCategoryService deleteService;

    @PostMapping
    public ResponseEntity<ApiResponse<RateCategoryResponse>> create(
            @Valid @RequestBody CreateRateCategoryRequest request) {
        log.info("Received request to create rate category.");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Rate category created successfully.",
                        createService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RateCategoryResponse>>> getAll() {
        log.info("Received request to fetch all rate categories.");
        return ResponseEntity.ok(ApiResponse.success(
                "Rate categories fetched successfully.",
                getAllService.getAll()));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<RateCategoryResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch rate category with uuid={}.", uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Rate category fetched successfully.",
                getByUuidService.getByUuid(uuid)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<RateCategoryResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateRateCategoryRequest request) {
        log.info("Received request to update rate category with uuid={}.", uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Rate category updated successfully.",
                updateService.update(uuid, request)));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {
        log.info("Received request to delete rate category with uuid={}.", uuid);
        deleteService.delete(uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Rate category deleted successfully.",
                null));
    }
}
