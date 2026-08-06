package com.smartdairy.settlement.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.settlement.dto.GenerateSettlementRequest;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.dto.SettlementSearchRequest;
import com.smartdairy.settlement.dto.UpdateSettlementRequest;
import com.smartdairy.settlement.service.DeleteSettlementService;
import com.smartdairy.settlement.service.GenerateSettlementService;
import com.smartdairy.settlement.service.GetSettlementService;
import com.smartdairy.settlement.service.PaySettlementService;
import com.smartdairy.settlement.service.SearchSettlementService;
import com.smartdairy.settlement.service.UpdateSettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Slf4j
@RequestMapping("/api/v1/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final GenerateSettlementService generateSettlementService;
    private final PaySettlementService paySettlementService;
        private final SearchSettlementService searchSettlementService;
        private final GetSettlementService getSettlementService;
        private final UpdateSettlementService updateSettlementService;
        private final DeleteSettlementService deleteSettlementService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<SettlementResponse>> generate(
            @Valid @RequestBody GenerateSettlementRequest request) {
        log.info("Received request to generate settlement.");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Settlement generated successfully.",
                        generateSettlementService.generate(request)));
    }

    @PatchMapping("/{uuid}/pay")
    public ResponseEntity<ApiResponse<SettlementResponse>> pay(
            @PathVariable UUID uuid) {
        log.info("Received request to pay settlement with uuid={}.", uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlement paid successfully.",
                        paySettlementService.pay(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SettlementResponse>>> search(
            SettlementSearchRequest request,
            Pageable pageable) {
        log.info("Received request to search settlements.");

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlements retrieved successfully.",
                        searchSettlementService.search(request, pageable)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<SettlementResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch settlement with uuid={}", uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlement retrieved successfully.",
                        getSettlementService.getByUuid(uuid)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<SettlementResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateSettlementRequest request) {
        log.info("Received request to update settlement with uuid={}", uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlement updated successfully.",
                        updateSettlementService.update(uuid, request)));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID uuid) {
        log.info("Received request to delete settlement with uuid={}", uuid);
        deleteSettlementService.delete(uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlement deleted successfully.",
                        null));
    }
}