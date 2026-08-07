package com.smartdairy.configuration.repository;

import com.smartdairy.configuration.entity.SmartDairyConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SmartDairyConfigurationRepository extends JpaRepository<SmartDairyConfiguration, Long> {

    @Query("SELECT c FROM SmartDairyConfiguration c WHERE c.uuid = ?1 AND c.active = true")
    Optional<SmartDairyConfiguration> findByUuidAndActive(UUID uuid);

    @Query("SELECT c FROM SmartDairyConfiguration c WHERE c.uuid = ?1")
    Optional<SmartDairyConfiguration> findByUuid(UUID uuid);

    @Query("SELECT c FROM SmartDairyConfiguration c WHERE c.tenantUuid = ?1 AND c.active = true")
    Optional<SmartDairyConfiguration> findByTenantUuidAndActive(UUID tenantUuid);

    @Query("SELECT c FROM SmartDairyConfiguration c WHERE c.tenantUuid = ?1")
    Optional<SmartDairyConfiguration> findByTenantUuid(UUID tenantUuid);
}
