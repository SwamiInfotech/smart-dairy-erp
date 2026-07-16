package com.smartdairy.auth.entity;

import com.smartdairy.tenant.entity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "user_tenant",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_tenant", columnNames = {"user_id", "tenant_id"})
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser appUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "tenant_uuid", nullable = false)
    private UUID tenantUuid;

    @Column(name = "role", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private UserTenantRole role;

    @Column(name = "is_owner", nullable = false)
    @Builder.Default
    private Boolean isOwner = false;

    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private Boolean isAdmin = false;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if user has a specific permission within this tenant
     */
    public boolean hasPermission(String permission) {
        if (permissions == null || permissions.trim().isEmpty()) {
            return false;
        }
        if (this.isAdmin) {
            return true; // Admins have all permissions
        }
        Set<String> perms = new HashSet<>(Arrays.asList(permissions.split(",")));
        return perms.contains(permission.trim());
    }

    /**
     * Check if user has any of the specified permissions
     */
    public boolean hasAnyPermission(String... permissionList) {
        return Arrays.stream(permissionList).anyMatch(this::hasPermission);
    }

    /**
     * Check if user has all specified permissions
     */
    public boolean hasAllPermissions(String... permissionList) {
        return Arrays.stream(permissionList).allMatch(this::hasPermission);
    }

    public boolean canInviteUsers() {
        return isOwner || isAdmin;
    }

    public boolean canManageUsers() {
        return isOwner || isAdmin || role == UserTenantRole.MANAGER;
    }

    public boolean canViewReports() {
        return !role.equals(UserTenantRole.VIEWER) || hasPermission("view_reports");
    }
}
