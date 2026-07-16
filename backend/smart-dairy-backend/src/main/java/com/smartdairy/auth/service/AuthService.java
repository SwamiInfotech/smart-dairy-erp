package com.smartdairy.auth.service;

import com.smartdairy.auth.dto.AuthTokenResponse;
import com.smartdairy.auth.dto.LoginRequest;
import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.auth.repository.UserTenantRepository;
import com.smartdairy.branch.entity.Branch;
import com.smartdairy.branch.repository.BranchRepository;
import com.smartdairy.company.entity.Company;
import com.smartdairy.company.repository.CompanyRepository;
import com.smartdairy.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final UserTenantRepository userTenantRepository;
    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;

    public AuthTokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        AppUser appUser = appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        // Determine which tenant to use
        UUID selectedTenantUuid = request.tenantUuid() != null
                ? request.tenantUuid()
                : appUser.getDefaultTenantUuid();

        // VALIDATE: User must have access to this tenant
        if (!appUser.hasAccessToTenant(selectedTenantUuid)) {
            throw new IllegalStateException("User does not have access to tenant: " + selectedTenantUuid);
        }

        // Get user's role in this tenant
        UserTenant userTenant = userTenantRepository.findByUserIdAndTenantUuid(appUser.getId(), selectedTenantUuid)
                .orElseThrow(() -> new IllegalStateException("User tenant mapping not found"));

        // Get role from JWT/Spring Security or use tenant-specific role
        String role = userTenant.getRole().name();

        // Generate token with tenant-specific role
        String token = jwtService.generateToken(
                authentication.getName(),
                role,
                selectedTenantUuid
        );

        // Get all accessible tenant IDs
        List<String> accessibleTenants = appUser.getAccessibleTenantIds().stream()
                .map(UUID::toString)
                .toList();

        Company company = companyRepository.findFirstByTenantUuidAndActiveTrueOrderByCreatedAtAsc(selectedTenantUuid)
                .orElseThrow(() -> new IllegalStateException("Company not found for tenant: " + selectedTenantUuid));

        Branch branch = branchRepository.findFirstByTenantUuidAndActiveTrueOrderByCreatedAtAsc(selectedTenantUuid)
                .orElse(null);

        return new AuthTokenResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                authentication.getName(),
                role,
                selectedTenantUuid.toString(),
                appUser.getDefaultTenantUuid().toString(),
                company.getUuid().toString(),
                company.getCompanyName(),
                branch != null ? branch.getUuid().toString() : "",
                branch != null ? branch.getBranchName() : "",
                accessibleTenants
        );
    }
}
