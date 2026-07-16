package com.smartdairy.auth.entity;

import com.smartdairy.common.entity.BaseEntity;
import com.smartdairy.tenant.entity.Tenant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "tenant_invitation",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_tenant_invitation_uuid", columnNames = "uuid"),
                @UniqueConstraint(name = "uk_tenant_invitation_token", columnNames = "invitation_token")
        }
)
public class TenantInvitation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_user_id", nullable = false)
    private AppUser invitedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_user_id")
    private AppUser acceptedByUser;

    @Column(name = "invitation_token", nullable = false, unique = true, updatable = false)
    private UUID invitationToken;

    @Column(name = "invited_username", nullable = false, length = 100)
    private String invitedUsername;

    @Column(name = "invited_full_name", length = 150)
    private String invitedFullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private UserTenantRole role;

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TenantInvitationStatus status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreateInvitation() {
        if (this.invitationToken == null) {
            this.invitationToken = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = TenantInvitationStatus.PENDING;
        }
    }
}
