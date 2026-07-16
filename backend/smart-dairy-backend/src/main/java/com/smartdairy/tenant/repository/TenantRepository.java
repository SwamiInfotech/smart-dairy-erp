package com.smartdairy.tenant.repository;

import com.smartdairy.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByUuid(UUID uuid);

    boolean existsByCodeIgnoreCase(String code);
}
