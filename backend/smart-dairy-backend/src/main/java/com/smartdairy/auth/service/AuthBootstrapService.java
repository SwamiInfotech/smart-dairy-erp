package com.smartdairy.auth.service;

import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.UserRole;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.entity.UserTenantRole;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.tenant.context.TenantContextHolder;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthBootstrapService {

    private final AppUserRepository appUserRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.default-user.username:admin}")
    private String defaultUsername;

    @Value("${app.security.default-user.password:admin123}")
    private String defaultPassword;

    @Value("${app.security.default-user.full-name:Default Admin}")
    private String defaultFullName;

    @Value("${app.security.default-user.role:ADMIN}")
    private UserRole defaultRole;

    @Value("${app.security.default-user.sync-existing:true}")
    private boolean syncExistingDefaultUser;

    @PostConstruct
    void ensureDefaultUser() {
        String username = defaultUsername.trim();

        if (username.isBlank()) {
            return;
        }

        AppUser existingUser = appUserRepository.findByUsernameIgnoreCase(username).orElse(null);
        if (existingUser != null) {
            if (!syncExistingDefaultUser) {
                return;
            }

            boolean changed = false;
            String fullName = defaultFullName.trim();

            if (!passwordEncoder.matches(defaultPassword, existingUser.getPasswordHash())) {
                existingUser.setPasswordHash(passwordEncoder.encode(defaultPassword));
                changed = true;
            }

            if (!existingUser.getRole().equals(defaultRole)) {
                existingUser.setRole(defaultRole);
                changed = true;
            }

            if (!existingUser.getFullName().equals(fullName)) {
                existingUser.setFullName(fullName);
                changed = true;
            }

            if (!Boolean.TRUE.equals(existingUser.getActive())) {
                existingUser.setActive(Boolean.TRUE);
                changed = true;
            }

            if (existingUser.getDefaultTenantUuid() == null) {
                existingUser.setDefaultTenantUuid(TenantContextHolder.getTenantUuidOrFallback());
                changed = true;
            }

            if (changed) {
                appUserRepository.save(existingUser);
            }
            return;
        }

        java.util.UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();
        Tenant tenant = tenantRepository.findByUuid(tenantUuid)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for default user: " + tenantUuid));

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(defaultPassword));
        user.setFullName(defaultFullName.trim());
        user.setRole(defaultRole);
        user.setDefaultTenantUuid(tenantUuid);
        user.setActive(Boolean.TRUE);

        UserTenant userTenant = new UserTenant();
        userTenant.setAppUser(user);
        userTenant.setTenant(tenant);
        userTenant.setTenantUuid(tenantUuid);
        userTenant.setRole(UserTenantRole.valueOf(defaultRole.name()));
        userTenant.setIsOwner(Boolean.FALSE);
        userTenant.setIsAdmin(defaultRole == UserRole.ADMIN);
        userTenant.setIsPrimary(Boolean.TRUE);
        userTenant.setActive(Boolean.TRUE);
        user.getUserTenants().add(userTenant);

        appUserRepository.save(user);
    }
}
