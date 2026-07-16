package com.smartdairy.auth.controller;

import com.smartdairy.auth.dto.CreateTenantInvitationRequest;
import com.smartdairy.auth.dto.TenantInvitationResponse;
import com.smartdairy.auth.service.TenantInvitationService;
import com.smartdairy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TenantInvitationController {

    private final TenantInvitationService tenantInvitationService;

    @PostMapping("/tenants/{tenantUuid}/invitations")
    public ResponseEntity<ApiResponse<TenantInvitationResponse>> create(
            @PathVariable UUID tenantUuid,
            @Valid @RequestBody CreateTenantInvitationRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tenant invitation created successfully.",
                        tenantInvitationService.create(tenantUuid, request, authentication)));
    }

    @GetMapping("/tenants/{tenantUuid}/invitations")
    public ApiResponse<List<TenantInvitationResponse>> listByTenant(
            @PathVariable UUID tenantUuid,
            Authentication authentication) {
        return ApiResponse.success("Tenant invitations fetched successfully.",
                tenantInvitationService.listByTenant(tenantUuid, authentication));
    }

    @GetMapping("/tenant-invitations/my-invitations")
    public ApiResponse<List<TenantInvitationResponse>> myInvitations(Authentication authentication) {
        return ApiResponse.success("Your invitations fetched successfully.",
                tenantInvitationService.listMyInvitations(authentication));
    }

    @PostMapping("/tenant-invitations/{invitationToken}/accept")
    public ApiResponse<TenantInvitationResponse> accept(
            @PathVariable UUID invitationToken,
            Authentication authentication) {
        return ApiResponse.success("Invitation accepted successfully.",
                tenantInvitationService.accept(invitationToken, authentication));
    }

    @PostMapping("/tenant-invitations/{invitationToken}/reject")
    public ApiResponse<TenantInvitationResponse> reject(
            @PathVariable UUID invitationToken,
            Authentication authentication) {
        return ApiResponse.success("Invitation rejected successfully.",
                tenantInvitationService.reject(invitationToken, authentication));
    }

    @PostMapping("/tenants/{tenantUuid}/invitations/{invitationToken}/cancel")
    public ApiResponse<TenantInvitationResponse> cancel(
            @PathVariable UUID tenantUuid,
            @PathVariable UUID invitationToken,
            Authentication authentication) {
        return ApiResponse.success("Tenant invitation cancelled successfully.",
                tenantInvitationService.cancel(tenantUuid, invitationToken, authentication));
    }
}
