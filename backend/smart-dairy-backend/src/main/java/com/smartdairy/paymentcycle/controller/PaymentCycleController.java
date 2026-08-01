package com.smartdairy.paymentcycle.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.paymentcycle.dto.CreatePaymentCycleRequest;
import com.smartdairy.paymentcycle.dto.PaymentCycleResponse;
import com.smartdairy.paymentcycle.dto.UpdatePaymentCycleRequest;
import com.smartdairy.paymentcycle.service.CreatePaymentCycleService;
import com.smartdairy.paymentcycle.service.DeletePaymentCycleService;
import com.smartdairy.paymentcycle.service.GetPaymentCycleByUuidService;
import com.smartdairy.paymentcycle.service.GetPaymentCycleService;
import com.smartdairy.paymentcycle.service.UpdatePaymentCycleService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment-cycles")
public class PaymentCycleController {

    private final CreatePaymentCycleService createService;
    private final GetPaymentCycleService getPaymentCycleService;
    private final GetPaymentCycleByUuidService getByUuidService;
    private final UpdatePaymentCycleService updateService;
    private final DeletePaymentCycleService deleteService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentCycleResponse>> create(
            @Valid @RequestBody CreatePaymentCycleRequest request) {
        log.info("Received request to create payment cycle.");
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                true,
                "Payment cycle created successfully.",
                createService.create(request),
                LocalDateTime.now()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentCycleResponse>>> getAll() {
        log.info("Received request to fetch all payment cycles.");
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment cycles fetched successfully.",
                getPaymentCycleService.getAll(),
                LocalDateTime.now()));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<PaymentCycleResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch payment cycle with uuid={}.", uuid);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment cycle fetched successfully.",
                getByUuidService.getByUuid(uuid),
                LocalDateTime.now()));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<PaymentCycleResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdatePaymentCycleRequest request) {
        log.info("Received request to update payment cycle with uuid={}.", uuid);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment cycle updated successfully.",
                updateService.update(uuid, request),
                LocalDateTime.now()));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {
        log.info("Received request to delete payment cycle with uuid={}.", uuid);
        deleteService.delete(uuid);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment cycle deleted successfully.",
                null,
                LocalDateTime.now()));
    }
}
