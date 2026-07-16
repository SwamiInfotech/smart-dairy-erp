package com.smartdairy.auth.controller;

import com.smartdairy.auth.dto.AuthUserResponse;
import com.smartdairy.auth.dto.CreateUserRequest;
import com.smartdairy.auth.dto.ResetPasswordRequest;
import com.smartdairy.auth.service.AuthUserService;
import com.smartdairy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth/users")
@RequiredArgsConstructor
public class AuthUserController {

    private final AuthUserService authUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<AuthUserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        AuthUserResponse response = authUserService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully.", response));
    }

    @GetMapping
    public ApiResponse<List<AuthUserResponse>> getAllUsers() {
        return ApiResponse.success("Users fetched successfully.", authUserService.getAll());
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authUserService.resetPassword(request);
        return ApiResponse.success("Password reset successfully.", null);
    }
}
