package com.smartdairy.auth.repository;

import com.smartdairy.auth.entity.TenantInvitation;
import com.smartdairy.auth.entity.TenantInvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantInvitationRepository extends JpaRepository<TenantInvitation, Long> {

    Optional<TenantInvitation> findByInvitationToken(UUID invitationToken);

    List<TenantInvitation> findByTenantUuidOrderByCreatedAtDesc(UUID tenantUuid);

    List<TenantInvitation> findByInvitedUsernameIgnoreCaseOrderByCreatedAtDesc(String invitedUsername);

    @Query("""
            SELECT CASE WHEN COUNT(ti) > 0 THEN true ELSE false END
            FROM TenantInvitation ti
            WHERE ti.tenantUuid = :tenantUuid
              AND LOWER(ti.invitedUsername) = LOWER(:invitedUsername)
              AND ti.status = :status
            """)
    boolean existsByTenantUuidAndInvitedUsernameIgnoreCaseAndStatus(
            @Param("tenantUuid") UUID tenantUuid,
            @Param("invitedUsername") String invitedUsername,
            @Param("status") TenantInvitationStatus status);
}
