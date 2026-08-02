package com.smartdairy.auth.repository;

import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.tenant.context.TenantContextHolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUuid(UUID uuid);

    Optional<AppUser> findFirstByTenantUuidAndUsernameIgnoreCaseOrderByIdAsc(UUID tenantUuid, String username);

    boolean existsByTenantUuidAndUsernameIgnoreCase(UUID tenantUuid, String username);

    default Optional<AppUser> findByUsernameIgnoreCase(String username) {
        return findFirstByTenantUuidAndUsernameIgnoreCaseOrderByIdAsc(
                TenantContextHolder.getTenantUuidOrFallback(),
                username
        );
    }

    default boolean existsByUsernameIgnoreCase(String username) {
        return existsByTenantUuidAndUsernameIgnoreCase(
                TenantContextHolder.getTenantUuidOrFallback(),
                username
        );
    }
}
