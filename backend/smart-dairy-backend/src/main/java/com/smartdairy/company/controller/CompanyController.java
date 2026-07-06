package com.smartdairy.company.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.company.dto.CompanyResponse;
import com.smartdairy.company.dto.CreateCompanyRequest;
import com.smartdairy.company.service.CreateCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CreateCompanyService service;

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyResponse>> create(
            @Valid @RequestBody CreateCompanyRequest request) {

        CompanyResponse response = service.create(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Company created successfully.",
                        response,
                        LocalDateTime.now()));

    }

}