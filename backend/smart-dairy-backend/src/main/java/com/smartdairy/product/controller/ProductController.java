package com.smartdairy.product.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.product.dto.CreateProductRequest;
import com.smartdairy.product.dto.ProductResponse;
import com.smartdairy.product.dto.ProductSearchRequest;
import com.smartdairy.product.dto.UpdateProductRequest;
import com.smartdairy.product.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final CreateProductService createProductService;
    private final GetProductService getProductService;
    private final SearchProductService searchProductService;
    private final UpdateProductService updateProductService;
    private final DeleteProductService deleteProductService;
    private final ActivateProductService activateProductService;
    private final DeactivateProductService deactivateProductService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody CreateProductRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Product created successfully.",
                        createProductService.create(request)));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<ProductResponse>> get(
            @PathVariable UUID uuid) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product retrieved successfully.",
                        getProductService.getByUuid(uuid)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> search(
            ProductSearchRequest request,
            @PageableDefault(
                    page = 0,
                    size = 20,
                    sort = "productName",
                    direction = Sort.Direction.ASC)
            Pageable pageable) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Products retrieved successfully.",
                        searchProductService.search(request, pageable)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateProductRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product updated successfully.",
                        updateProductService.update(uuid, request)));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID uuid) {

        deleteProductService.delete(uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product deleted successfully.",
                        null));
    }

    @PatchMapping("/{uuid}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(
            @PathVariable UUID uuid) {

        activateProductService.activate(uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product activated successfully.",
                        null));
    }

    @PatchMapping("/{uuid}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable UUID uuid) {

        deactivateProductService.deactivate(uuid);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product deactivated successfully.",
                        null));
    }

}