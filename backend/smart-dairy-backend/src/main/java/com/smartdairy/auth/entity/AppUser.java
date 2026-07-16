package com.smartdairy.auth.entity;

import com.smartdairy.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "app_user",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_app_user_tenant_username", columnNames = {"tenant_uuid", "username"})
        }
)
public class AppUser extends BaseEntity {

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private UserRole role;

    @Column(name = "default_tenant_uuid", nullable = false)
    private UUID defaultTenantUuid;

    @OneToMany(
            mappedBy = "appUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<UserTenant> userTenants = new ArrayList<>();

    /**
     * Check if user has access to a specific tenant
     */
    public boolean hasAccessToTenant(UUID tenantUuid) {
        return userTenants.stream()
                .anyMatch(ut -> ut.getTenantUuid().equals(tenantUuid) && ut.getActive());
    }

    /**
     * Get the primary/default tenant access record
     */
    public UserTenant getPrimaryTenantAccess() {
        return userTenants.stream()
                .filter(ut -> Boolean.TRUE.equals(ut.getIsPrimary()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Get all accessible tenant UUIDs
     */
    public List<UUID> getAccessibleTenantIds() {
        return userTenants.stream()
                .filter(UserTenant::getActive)
                .map(UserTenant::getTenantUuid)
                .toList();
    }

    /**
     * Get user's role in a specific tenant
     */
    public UserTenantRole getRoleInTenant(UUID tenantUuid) {
        return userTenants.stream()
                .filter(ut -> ut.getTenantUuid().equals(tenantUuid) && ut.getActive())
                .map(UserTenant::getRole)
                .findFirst()
                .orElse(null);
    }

    /**
     * Check if user is owner of a specific tenant
     */
    public boolean isOwnerOfTenant(UUID tenantUuid) {
        return userTenants.stream()
                .anyMatch(ut -> ut.getTenantUuid().equals(tenantUuid) && ut.getIsOwner() && ut.getActive());
    }

    /**
     * Check if user is admin of a specific tenant
     */
    public boolean isAdminOfTenant(UUID tenantUuid) {
        return userTenants.stream()
                .anyMatch(ut -> ut.getTenantUuid().equals(tenantUuid) && ut.getIsAdmin() && ut.getActive());
    }
}
