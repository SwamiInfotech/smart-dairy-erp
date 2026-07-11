package com.smartdairy.customer.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.customer.dto.*;
import com.smartdairy.customer.service.command.ActivateCustomerService;
import com.smartdairy.customer.service.command.CreateCustomerService;
import com.smartdairy.customer.service.command.DeactivateCustomerService;
import com.smartdairy.customer.service.command.UpdateCustomerService;
import com.smartdairy.customer.service.query.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CreateCustomerService createCustomerService;
    private final GetAllCustomerService getAllCustomerService;
    private final GetCustomerByUuidService getCustomerByUuidService;
    private final UpdateCustomerService updateCustomerService;
    private final ActivateCustomerService activateCustomerService;
    private final DeactivateCustomerService deactivateCustomerService;
    private final CustomerLedgerQueryService customerLedgerQueryService;
    private final GetCustomerStatementService getCustomerStatementService;
    private final GetCustomerOutstandingService getCustomerOutstandingService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> create(
            @Valid @RequestBody CreateCustomerRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Customer created successfully.",
                        createCustomerService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> search(
            CustomerSearchRequest request,

            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "customerName",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customers retrieved successfully.",
                        getAllCustomerService.search(request, pageable)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<CustomerResponse>> get(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer retrieved successfully.",
                        getCustomerByUuidService.get(uuid)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateCustomerRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer updated successfully.",
                        updateCustomerService.update(uuid, request)));
    }

    @PatchMapping("/{uuid}/activate")
    public ResponseEntity<ApiResponse<CustomerResponse>> activate(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer activated successfully.",
                        activateCustomerService.activate(uuid)));
    }

    @PatchMapping("/{uuid}/deactivate")
    public ResponseEntity<ApiResponse<CustomerResponse>> deactivate(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer deactivated successfully.",
                        deactivateCustomerService.deactivate(uuid)));
    }

    @GetMapping("/{uuid}/ledger")
    public ResponseEntity<ApiResponse<List<CustomerLedgerResponse>>> ledger(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer ledger retrieved successfully.",
                        customerLedgerQueryService.getLedger(uuid)));
    }

    @GetMapping("/{uuid}/statement")
    public ResponseEntity<ApiResponse<List<CustomerStatementResponse>>> statement(@PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer statement retrieved successfully.",
                        getCustomerStatementService.getStatement(uuid)));

    }

    @GetMapping("/outstanding")
    public ResponseEntity<ApiResponse<List<CustomerOutstandingResponse>>> outstanding() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Customer outstanding retrieved successfully.",
                        getCustomerOutstandingService.getOutstanding()));

    }
}