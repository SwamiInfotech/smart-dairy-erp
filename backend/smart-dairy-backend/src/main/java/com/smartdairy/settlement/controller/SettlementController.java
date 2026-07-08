package com.smartdairy.settlement.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.settlement.dto.GenerateSettlementRequest;
import com.smartdairy.settlement.dto.SettlementResponse;
import com.smartdairy.settlement.service.GenerateSettlementService;
import com.smartdairy.settlement.service.PaySettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final GenerateSettlementService generateSettlementService;
    private final PaySettlementService paySettlementService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<SettlementResponse>> generate(
            @Valid @RequestBody GenerateSettlementRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Settlement generated successfully.",
                        generateSettlementService.generate(request)));
    }

    @PatchMapping("/{uuid}/pay")
    public ResponseEntity<ApiResponse<SettlementResponse>> pay(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Settlement paid successfully.",
                        paySettlementService.pay(uuid)));
    }
}