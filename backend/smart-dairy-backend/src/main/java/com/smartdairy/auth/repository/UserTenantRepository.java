package com.smartdairy.auth.repository;

import com.smartdairy.auth.entity.UserTenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserTenantRepository extends JpaRepository<UserTenant, Long> {

    /**
     * Find user-tenant relationship by user ID and tenant UUID
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.appUser.id = :userId AND ut.tenantUuid = :tenantUuid")
    Optional<UserTenant> findByUserIdAndTenantUuid(@Param("userId") Long userId, @Param("tenantUuid") UUID tenantUuid);

    /**
     * Find all active tenants for a user
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.appUser.id = :userId AND ut.active = true ORDER BY ut.isPrimary DESC")
    List<UserTenant> findAllByUserIdAndActive(@Param("userId") Long userId);

    /**
     * Find primary/default tenant for a user
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.appUser.id = :userId AND ut.isPrimary = true AND ut.active = true")
    Optional<UserTenant> findPrimaryByUserId(@Param("userId") Long userId);

    /**
     * Check if user has access to a tenant
     */
    @Query("SELECT CASE WHEN COUNT(ut) > 0 THEN true ELSE false END FROM UserTenant ut WHERE ut.appUser.id = :userId AND ut.tenantUuid = :tenantUuid AND ut.active = true")
    boolean hasAccessToTenant(@Param("userId") Long userId, @Param("tenantUuid") UUID tenantUuid);

    /**
     * Find all users in a tenant with a specific role
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.tenantUuid = :tenantUuid AND ut.role = :role AND ut.active = true")
    List<UserTenant> findByTenantUuidAndRole(@Param("tenantUuid") UUID tenantUuid, @Param("role") String role);

    /**
     * Find all admins in a tenant
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.tenantUuid = :tenantUuid AND ut.isAdmin = true AND ut.active = true")
    List<UserTenant> findAllAdminsByTenantUuid(@Param("tenantUuid") UUID tenantUuid);

    /**
     * Find all owners in a tenant
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.tenantUuid = :tenantUuid AND ut.isOwner = true AND ut.active = true")
    List<UserTenant> findAllOwnersByTenantUuid(@Param("tenantUuid") UUID tenantUuid);

    /**
     * Count active users in a tenant
     */
    @Query("SELECT COUNT(ut) FROM UserTenant ut WHERE ut.tenantUuid = :tenantUuid AND ut.active = true")
    long countByTenantUuidAndActive(@Param("tenantUuid") UUID tenantUuid);

    /**
     * Find all users in a tenant
     */
    @Query("SELECT ut FROM UserTenant ut WHERE ut.tenantUuid = :tenantUuid AND ut.active = true")
    List<UserTenant> findAllByTenantUuid(@Param("tenantUuid") UUID tenantUuid);

    /**
     * Deactivate all user-tenant relationships for a user
     */
    @Query("UPDATE UserTenant ut SET ut.active = false WHERE ut.appUser.id = :userId")
    void deactivateAllByUserId(@Param("userId") Long userId);
}
