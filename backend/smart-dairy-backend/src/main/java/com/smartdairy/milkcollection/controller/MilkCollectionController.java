package com.smartdairy.milkcollection.controller;


import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.milkcollection.dto.CreateMilkCollectionRequest;
import com.smartdairy.milkcollection.dto.MilkCollectionResponse;
import com.smartdairy.milkcollection.service.CreateMilkCollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/milk-collections")
@RequiredArgsConstructor
public class MilkCollectionController {

    private final CreateMilkCollectionService service;

    @PostMapping
    public ResponseEntity<ApiResponse<MilkCollectionResponse>> create(
            @Valid @RequestBody CreateMilkCollectionRequest request) {

        MilkCollectionResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Milk collection saved successfully.",
                        response));
    }

}