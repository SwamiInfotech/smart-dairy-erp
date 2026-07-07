package com.smartdairy.loan.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.loan.dto.CreateLoanRequest;
import com.smartdairy.loan.dto.LoanResponse;
import com.smartdairy.loan.dto.LoanSearchRequest;
import com.smartdairy.loan.dto.UpdateLoanRequest;
import com.smartdairy.loan.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
public class LoanController {

    private final CreateLoanService service;
    private final GetLoanService getLoanService;
    private final GetAllLoanService getAllLoanService;
    private final UpdateLoanService updateLoanService;
    private final DeleteLoanService deleteLoanService;
    private final ApproveLoanService approveLoanService;

    @PostMapping
    public ResponseEntity<ApiResponse<LoanResponse>> create(
            @Valid @RequestBody CreateLoanRequest request) {

        LoanResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Loan created successfully.", response));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<LoanResponse>> getByUuid(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(ApiResponse.success(
                "Loan retrieved successfully.",
                getLoanService.getByUuid(uuid)));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> search(LoanSearchRequest request, Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success("Loans retrieved successfully.", getAllLoanService.search(
                request,
                pageable)
        ));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<LoanResponse>> update(@PathVariable UUID uuid, @Valid @RequestBody UpdateLoanRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Loan updated successfully.", updateLoanService.update(uuid, request)

        ));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {

        deleteLoanService.delete(uuid);

        return ResponseEntity.ok(ApiResponse.success(
                "Loan deleted successfully.",
                null));
    }

    @PatchMapping("/{uuid}/approve")
    public ResponseEntity<ApiResponse<LoanResponse>> approve(@PathVariable UUID uuid) {

        return ResponseEntity.ok(ApiResponse.success(
                "Loan approved successfully.",
                approveLoanService.approve(uuid)));
    }
}