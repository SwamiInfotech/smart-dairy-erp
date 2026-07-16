package com.smartdairy.auth.service;

import com.smartdairy.auth.dto.CreateTenantInvitationRequest;
import com.smartdairy.auth.dto.TenantInvitationResponse;
import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.entity.TenantInvitation;
import com.smartdairy.auth.entity.TenantInvitationStatus;
import com.smartdairy.auth.entity.UserTenant;
import com.smartdairy.auth.entity.UserTenantRole;
import com.smartdairy.auth.repository.AppUserRepository;
import com.smartdairy.auth.repository.TenantInvitationRepository;
import com.smartdairy.auth.repository.UserTenantRepository;
import com.smartdairy.exception.ResourceNotFoundException;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantInvitationService {

    private static final int DEFAULT_EXPIRY_DAYS = 7;

    private final AppUserRepository appUserRepository;
    private final UserTenantRepository userTenantRepository;
    private final TenantRepository tenantRepository;
    private final TenantInvitationRepository tenantInvitationRepository;

    @Transactional
    public TenantInvitationResponse create(UUID tenantUuid, CreateTenantInvitationRequest request, Authentication authentication) {
        AppUser inviter = getAuthenticatedUser(authentication);
        Tenant tenant = getActiveTenant(tenantUuid);
        UserTenant inviterAccess = requireTenantAccess(inviter, tenantUuid);

        if (!inviterAccess.canInviteUsers()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to invite users for this shop");
        }

        String invitedUsername = request.invitedUsername().trim();
        if (invitedUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invited username is required");
        }

        if (inviter.getUsername().equalsIgnoreCase(invitedUsername)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have access to this shop");
        }

        if (tenantInvitationRepository.existsByTenantUuidAndInvitedUsernameIgnoreCaseAndStatus(
                tenantUuid, invitedUsername, TenantInvitationStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A pending invitation already exists for this user in this shop");
        }

        appUserRepository.findByUsernameIgnoreCase(invitedUsername).ifPresent(existingUser -> {
            if (existingUser.hasAccessToTenant(tenantUuid)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has access to this shop");
            }
        });

        TenantInvitation invitation = new TenantInvitation();
        invitation.setTenant(tenant);
        invitation.setTenantUuid(tenantUuid);
        invitation.setInvitedByUser(inviter);
        invitation.setInvitedUsername(invitedUsername);
        invitation.setInvitedFullName(normalizeOrNull(request.invitedFullName()));
        invitation.setRole(request.role());
        invitation.setPermissions(normalizeOrNull(request.permissions()));
        invitation.setExpiresAt(resolveExpiry(request.expiresInDays()));
        invitation.setStatus(TenantInvitationStatus.PENDING);
        invitation.setActive(Boolean.TRUE);

        return toResponse(tenantInvitationRepository.save(invitation));
    }

    @Transactional(readOnly = true)
    public List<TenantInvitationResponse> listByTenant(UUID tenantUuid, Authentication authentication) {
        AppUser requester = getAuthenticatedUser(authentication);
        requireCanManageTenant(requester, tenantUuid);

        return tenantInvitationRepository.findByTenantUuidOrderByCreatedAtDesc(tenantUuid)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TenantInvitationResponse> listMyInvitations(Authentication authentication) {
        AppUser requester = getAuthenticatedUser(authentication);
        return tenantInvitationRepository.findByInvitedUsernameIgnoreCaseOrderByCreatedAtDesc(requester.getUsername())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TenantInvitationResponse accept(UUID invitationToken, Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        TenantInvitation invitation = getInvitation(invitationToken);
        ensureNotExpired(invitation);
        ensureInvitationBelongsToUser(invitation, user);

        if (user.hasAccessToTenant(invitation.getTenantUuid())) {
            invitation.setStatus(TenantInvitationStatus.ACCEPTED);
            invitation.setAcceptedByUser(user);
            invitation.setRespondedAt(LocalDateTime.now());
            return toResponse(tenantInvitationRepository.save(invitation));
        }

        Tenant tenant = invitation.getTenant();
        UserTenant userTenant = new UserTenant();
        userTenant.setAppUser(user);
        userTenant.setTenant(tenant);
        userTenant.setTenantUuid(tenant.getUuid());
        userTenant.setRole(invitation.getRole());
        userTenant.setPermissions(invitation.getPermissions());
        userTenant.setIsOwner(invitation.getRole() == UserTenantRole.OWNER);
        userTenant.setIsAdmin(invitation.getRole() == UserTenantRole.ADMIN || invitation.getRole() == UserTenantRole.OWNER);
        userTenant.setIsPrimary(!hasAnyActiveTenantAccess(user));
        userTenant.setActive(Boolean.TRUE);

        user.getUserTenants().add(userTenant);
        if (Boolean.TRUE.equals(userTenant.getIsPrimary())) {
            user.setDefaultTenantUuid(tenant.getUuid());
        }

        appUserRepository.save(user);

        invitation.setStatus(TenantInvitationStatus.ACCEPTED);
        invitation.setAcceptedByUser(user);
        invitation.setRespondedAt(LocalDateTime.now());

        return toResponse(tenantInvitationRepository.save(invitation));
    }

    @Transactional
    public TenantInvitationResponse reject(UUID invitationToken, Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        TenantInvitation invitation = getInvitation(invitationToken);
        ensureNotExpired(invitation);
        ensureInvitationBelongsToUser(invitation, user);

        invitation.setStatus(TenantInvitationStatus.REJECTED);
        invitation.setAcceptedByUser(user);
        invitation.setRespondedAt(LocalDateTime.now());
        invitation.setActive(Boolean.FALSE);

        return toResponse(tenantInvitationRepository.save(invitation));
    }

    @Transactional
    public TenantInvitationResponse cancel(UUID tenantUuid, UUID invitationToken, Authentication authentication) {
        AppUser requester = getAuthenticatedUser(authentication);
        requireCanManageTenant(requester, tenantUuid);

        TenantInvitation invitation = getInvitation(invitationToken);
        if (!invitation.getTenantUuid().equals(tenantUuid)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found for this shop");
        }
        if (invitation.getStatus() != TenantInvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending invitations can be cancelled");
        }

        invitation.setStatus(TenantInvitationStatus.CANCELLED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitation.setActive(Boolean.FALSE);

        return toResponse(tenantInvitationRepository.save(invitation));
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return appUserRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found: " + authentication.getName()));
    }

    private Tenant getActiveTenant(UUID tenantUuid) {
        Tenant tenant = tenantRepository.findByUuid(tenantUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantUuid));
        if (Boolean.FALSE.equals(tenant.getActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tenant is inactive: " + tenantUuid);
        }
        return tenant;
    }

    private UserTenant requireTenantAccess(AppUser user, UUID tenantUuid) {
        return userTenantRepository.findByUserIdAndTenantUuid(user.getId(), tenantUuid)
                .filter(UserTenant::getActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this shop"));
    }

    private void requireCanManageTenant(AppUser user, UUID tenantUuid) {
        UserTenant access = requireTenantAccess(user, tenantUuid);
        if (!access.canInviteUsers()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to manage invitations for this shop");
        }
    }

    private TenantInvitation getInvitation(UUID invitationToken) {
        return tenantInvitationRepository.findByInvitationToken(invitationToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found: " + invitationToken));
    }

    private void ensureInvitationBelongsToUser(TenantInvitation invitation, AppUser user) {
        if (!invitation.getInvitedUsername().equalsIgnoreCase(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation was not created for your account");
        }
        if (invitation.getStatus() != TenantInvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This invitation is no longer pending");
        }
    }

    private void ensureNotExpired(TenantInvitation invitation) {
        if (invitation.getStatus() != TenantInvitationStatus.PENDING) {
            return;
        }
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(TenantInvitationStatus.EXPIRED);
            invitation.setRespondedAt(LocalDateTime.now());
            invitation.setActive(Boolean.FALSE);
            tenantInvitationRepository.save(invitation);
            throw new ResponseStatusException(HttpStatus.GONE, "This invitation has expired");
        }
    }

    private boolean hasAnyActiveTenantAccess(AppUser user) {
        return !userTenantRepository.findAllByUserIdAndActive(user.getId()).isEmpty();
    }

    private LocalDateTime resolveExpiry(Integer expiresInDays) {
        int days = expiresInDays == null ? DEFAULT_EXPIRY_DAYS : expiresInDays;
        return LocalDateTime.now().plusDays(days);
    }

    private String normalizeOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private TenantInvitationResponse toResponse(TenantInvitation invitation) {
        return new TenantInvitationResponse(
                invitation.getUuid(),
                invitation.getInvitationToken(),
                invitation.getTenantUuid(),
                invitation.getTenant().getCode(),
                invitation.getTenant().getName(),
                invitation.getInvitedUsername(),
                invitation.getInvitedFullName(),
                invitation.getRole().name(),
                invitation.getPermissions(),
                invitation.getStatus().name(),
                invitation.getInvitedByUser() != null ? invitation.getInvitedByUser().getUsername() : null,
                invitation.getAcceptedByUser() != null ? invitation.getAcceptedByUser().getUsername() : null,
                invitation.getExpiresAt(),
                invitation.getRespondedAt(),
                invitation.getCreatedAt(),
                invitation.getUpdatedAt()
        );
    }
}
