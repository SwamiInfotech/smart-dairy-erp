package com.smartdairy.auth.controller;

import com.smartdairy.auth.dto.AuthTokenResponse;
import com.smartdairy.auth.dto.LoginRequest;
import com.smartdairy.auth.service.AuthService;
import com.smartdairy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthTokenResponse> login(
            @RequestHeader("X-Tenant-Id") UUID tenantUuid,
            @Valid @RequestBody LoginRequest request) {
        LoginRequest effectiveRequest = request.tenantUuid() == null
                ? new LoginRequest(request.username(), request.password(), tenantUuid)
                : request;

        AuthTokenResponse token = authService.login(effectiveRequest);
        return ApiResponse.success("Login successful", token);
    }
}
