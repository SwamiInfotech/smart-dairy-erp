package com.smartdairy.auth.controller;

import com.smartdairy.auth.dto.AuthTokenResponse;
import com.smartdairy.auth.dto.TenantDTO;
import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.auth.repository.UserTenantRepository;
import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.security.jwt.JwtService;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TenantAuthController {

    private final UserTenantRepository userTenantRepository;
    private final AppUserRepository appUserRepository;
    private final TenantRepository tenantRepository;
    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final JwtService jwtService;

    /**
     * Get all shops/tenants the authenticated user can access
     */
    @GetMapping("/my-shops")
    public ResponseEntity<List<TenantDTO>> getMyShops(Authentication authentication) {
        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        List<TenantDTO> shops = appUser.getUserTenants().stream()
                .filter(UserTenant::getActive)
                .map(userTenant -> TenantDTO.builder()
                        .uuid(userTenant.getTenantUuid())
                        .code(userTenant.getTenant().getCode())
                        .name(userTenant.getTenant().getName())
                        .role(userTenant.getRole().name())
                        .isPrimary(userTenant.getIsPrimary())
                        .isOwner(userTenant.getIsOwner())
                        .isAdmin(userTenant.getIsAdmin())
                        .active(userTenant.getActive())
                        .createdAt(userTenant.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(shops);
    }

    /**
     * Switch to a different shop/tenant
     * Returns a new JWT token for the selected tenant
     */
    @PostMapping("/switch-shop/{tenantUuid}")
    public ResponseEntity<?> switchTenant(
            @PathVariable UUID tenantUuid,
            Authentication authentication) {
        
        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Validate user has access to this tenant
        if (!appUser.hasAccessToTenant(tenantUuid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied", "You do not have access to this shop"));
        }

        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantUuid(appUser.getId(), tenantUuid)
                .orElseThrow(() -> new IllegalStateException("User tenant mapping not found"));

        // Generate new token for this tenant
        String token = jwtService.generateToken(
                appUser.getUsername(),
                userTenant.getRole().name(),
                tenantUuid
        );

        // Get all accessible tenant IDs
        List<String> accessibleTenants = appUser.getAccessibleTenantIds().stream()
                .map(UUID::toString)
                .toList();

        Company company = companyRepository.findFirstByTenantUuidAndActiveTrueOrderByCreatedAtAsc(tenantUuid)
                .orElseThrow(() -> new IllegalStateException("Company not found for tenant: " + tenantUuid));
        Branch branch = branchRepository.findFirstByTenantUuidAndActiveTrueOrderByCreatedAtAsc(tenantUuid)
                .orElse(null);

        return ResponseEntity.ok(new AuthTokenResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                appUser.getUsername(),
                userTenant.getRole().name(),
                tenantUuid.toString(),
                appUser.getDefaultTenantUuid().toString(),
                company.getUuid().toString(),
                company.getCompanyName(),
                branch != null ? branch.getUuid().toString() : "",
                branch != null ? branch.getBranchName() : "",
                accessibleTenants
        ));
    }

    /**
     * Set a tenant as primary/default for the user
     */
    @PostMapping("/set-primary-shop/{tenantUuid}")
    public ResponseEntity<?> setPrimaryShop(
            @PathVariable UUID tenantUuid,
            Authentication authentication) {
        
        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Validate user has access to this tenant
        if (!appUser.hasAccessToTenant(tenantUuid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Access denied", "You do not have access to this shop"));
        }

        // Set all to non-primary
        appUser.getUserTenants().forEach(ut -> ut.setIsPrimary(false));

        // Set selected as primary
        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantUuid(appUser.getId(), tenantUuid)
                .orElseThrow(() -> new IllegalStateException("User tenant mapping not found"));
        userTenant.setIsPrimary(true);

        // Update user's default tenant
        appUser.setDefaultTenantUuid(tenantUuid);
        appUserRepository.save(appUser);

        return ResponseEntity.ok(new SuccessResponse("Primary shop updated successfully"));
    }

    /**
     * Error response DTO
     */
    record ErrorResponse(String error, String message) {}

    /**
     * Success response DTO
     */
    record SuccessResponse(String message) {}
}
