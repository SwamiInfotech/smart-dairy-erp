package com.smartdairy.collectionmethod.controller;

import com.smartdairy.collectionmethod.dto.CreateCollectionMethodRequest;
import com.smartdairy.collectionmethod.dto.CollectionMethodResponse;
import com.smartdairy.collectionmethod.dto.UpdateCollectionMethodRequest;
import com.smartdairy.collectionmethod.service.CreateCollectionMethodService;
import com.smartdairy.collectionmethod.service.DeleteCollectionMethodService;
import com.smartdairy.collectionmethod.service.GetCollectionMethodByUuidService;
import com.smartdairy.collectionmethod.service.GetCollectionMethodService;
import com.smartdairy.collectionmethod.service.UpdateCollectionMethodService;
import com.smartdairy.common.response.ApiResponse;
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
@RequestMapping("/api/v1/master/collection-methods")
public class CollectionMethodController {

    private final CreateCollectionMethodService createService;
    private final GetCollectionMethodService getAllService;
    private final GetCollectionMethodByUuidService getByUuidService;
    private final UpdateCollectionMethodService updateService;
    private final DeleteCollectionMethodService deleteService;

    @PostMapping
    public ResponseEntity<ApiResponse<CollectionMethodResponse>> create(
            @Valid @RequestBody CreateCollectionMethodRequest request) {
        log.info("Received request to create collection method.");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Collection method created successfully.",
                        createService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollectionMethodResponse>>> getAll() {
        log.info("Received request to fetch all collection methods.");
        return ResponseEntity.ok(ApiResponse.success(
                "Collection methods fetched successfully.",
                getAllService.getAll()));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<CollectionMethodResponse>> getByUuid(
            @PathVariable UUID uuid) {
        log.info("Received request to fetch collection method with uuid={}.", uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Collection method fetched successfully.",
                getByUuidService.getByUuid(uuid)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<CollectionMethodResponse>> update(
            @PathVariable UUID uuid,
            @Valid @RequestBody UpdateCollectionMethodRequest request) {
        log.info("Received request to update collection method with uuid={}.", uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Collection method updated successfully.",
                updateService.update(uuid, request)));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {
        log.info("Received request to delete collection method with uuid={}.", uuid);
        deleteService.delete(uuid);
        return ResponseEntity.ok(ApiResponse.success(
                "Collection method deleted successfully.",
                null));
    }
}
