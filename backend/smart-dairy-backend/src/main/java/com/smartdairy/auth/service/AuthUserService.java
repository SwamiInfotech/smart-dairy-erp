package com.smartdairy.auth.service;

import com.smartdairy.auth.dto.AuthUserResponse;
import com.smartdairy.auth.dto.CreateUserRequest;
import com.smartdairy.auth.dto.ResetPasswordRequest;
import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.UserRole;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.entity.UserTenantRole;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.tenant.context.TenantContextHolder;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthUserService {

    private final AppUserRepository appUserRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthUserResponse create(CreateUserRequest request) {
        String username = request.username().trim();
        String fullName = request.fullName().trim();

        if (username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (fullName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists: " + username);
        }

        AppUser user = new AppUser();
        UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();
        Tenant tenant = tenantRepository.findByUuid(tenantUuid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant not found: " + tenantUuid));

        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setRole(request.role());
        user.setDefaultTenantUuid(tenantUuid);
        user.setActive(Boolean.TRUE);

        UserTenant userTenant = new UserTenant();
        userTenant.setAppUser(user);
        userTenant.setTenant(tenant);
        userTenant.setTenantUuid(tenantUuid);
        userTenant.setRole(UserTenantRole.valueOf(request.role().name()));
        userTenant.setIsOwner(Boolean.FALSE);
        userTenant.setIsAdmin(request.role() == UserRole.ADMIN);
        userTenant.setIsPrimary(Boolean.TRUE);
        userTenant.setActive(Boolean.TRUE);

        user.getUserTenants().add(userTenant);

        AppUser saved = appUserRepository.save(user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AuthUserResponse> getAll() {
        return appUserRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String username = request.username().trim();
        if (username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }

        AppUser user = appUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }

    private AuthUserResponse toResponse(AppUser user) {
        return new AuthUserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
