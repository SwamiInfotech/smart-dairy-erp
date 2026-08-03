package com.smartdairy.onboarding.controller;

import com.smartdairy.common.response.ApiResponse;
import com.smartdairy.onboarding.dto.PublicOnboardingRequest;
import com.smartdairy.onboarding.dto.PublicOnboardingResponse;
import com.smartdairy.onboarding.service.PublicOnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicOnboardingController {

    private final PublicOnboardingService publicOnboardingService;

    @PostMapping("/onboard")
    public ResponseEntity<ApiResponse<PublicOnboardingResponse>> onboard(
            @Valid @RequestBody PublicOnboardingRequest request) {
        log.info("Received public onboarding request for tenant code={}.", request.tenantCode());
        PublicOnboardingResponse response = publicOnboardingService.onboard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Onboarding completed successfully.", response));
    }
}
