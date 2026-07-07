package com.smartdairy.milkcollection.controller;


import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.milkcollection.dto.*;
import com.smartdairy.milkcollection.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/milk-collections")
@RequiredArgsConstructor
public class MilkCollectionController {

    private final CreateMilkCollectionService service;

    private final GetAllMilkCollectionService getAllMilkCollectionService;
    private final UpdateMilkCollectionService updateMilkCollectionService;
    private final LockMilkCollectionService lockMilkCollectionService;
    private final DeleteMilkCollectionService deleteMilkCollectionService;
    private final DailyMilkCollectionSummaryService dailyMilkCollectionSummaryService;

    @PostMapping
    public ResponseEntity<ApiResponse<MilkCollectionResponse>> create(@Valid @RequestBody CreateMilkCollectionRequest request) {

        MilkCollectionResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Milk collection saved successfully.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MilkCollectionResponse>>> search(MilkCollectionSearchRequest request, @PageableDefault(page = 0, size = 20, sort = "collectionDate", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success("Milk collections retrieved successfully.", getAllMilkCollectionService.search(request, pageable)));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<MilkCollectionResponse>> update(@PathVariable UUID uuid, @Valid @RequestBody UpdateMilkCollectionRequest request) {

        MilkCollectionResponse response = updateMilkCollectionService.update(uuid, request);

        return ResponseEntity.ok(ApiResponse.success("Milk Collection updated successfully.", response));
    }

    @PatchMapping("/{uuid}/lock")
    public ResponseEntity<ApiResponse<MilkCollectionResponse>> lock(@PathVariable UUID uuid) {

        MilkCollectionResponse response = lockMilkCollectionService.lock(uuid);

        return ResponseEntity.ok(ApiResponse.success("Milk Collection locked successfully.", response));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID uuid) {

        deleteMilkCollectionService.delete(uuid);

        return ResponseEntity.ok(ApiResponse.success("Milk Collection deleted successfully.", null));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DailyMilkCollectionSummaryResponse>> summary(@RequestParam LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success("Daily Summary", dailyMilkCollectionSummaryService.summary(date)));
    }
}