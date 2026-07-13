package com.smartdairy.auth.controller;

import com.smartdairy.auth.dto.AuthTokenResponse;
import com.smartdairy.auth.dto.LoginRequest;
import com.smartdairy.auth.service.AuthService;
import com.smartdairy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthTokenResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthTokenResponse token = authService.login(request);
        return ApiResponse.success("Login successful", token);
    }
}
