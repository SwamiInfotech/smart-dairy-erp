package com.smartdairy.payment.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.payment.dto.CreatePaymentRequest;
import com.smartdairy.payment.dto.PaymentResponse;
import com.smartdairy.payment.dto.PaymentSearchRequest;
import com.smartdairy.payment.service.CreatePaymentService;
import com.smartdairy.payment.service.GetPaymentService;
import com.smartdairy.payment.service.SearchPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final CreatePaymentService createPaymentService;

    private final GetPaymentService getPaymentService;

    private final SearchPaymentService searchPaymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> create(
            @Valid @RequestBody CreatePaymentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Payment created successfully.",
                        createPaymentService.create(request)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByUuid(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payment retrieved successfully.",
                        getPaymentService.getByUuid(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> search(
            PaymentSearchRequest request,
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Payments retrieved successfully.",
                        searchPaymentService.search(request, pageable)));
    }

}