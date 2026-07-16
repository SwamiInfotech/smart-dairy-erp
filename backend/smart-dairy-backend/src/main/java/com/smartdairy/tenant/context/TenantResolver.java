package com.smartdairy.tenant.context;

import com.smartdairy.security.jwt.JwtService;
import com.smartdairy.tenant.entity.Tenant;
import com.smartdairy.tenant.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantResolver {

    private final JwtService jwtService;
    private final TenantRepository tenantRepository;

    @Value("${app.tenant.header-name:X-Tenant-Id}")
    private String tenantHeaderName;

    @Value("${app.tenant.default-id:00000000-0000-0000-0000-000000000001}")
    private UUID defaultTenantUuid;

    public UUID resolveTenantUuid(HttpServletRequest request) {
        UUID headerTenantUuid = resolveFromHeader(request.getHeader(tenantHeaderName));
        UUID tokenTenantUuid = resolveFromToken(request.getHeader(HttpHeaders.AUTHORIZATION));

        if (headerTenantUuid != null && tokenTenantUuid != null && !headerTenantUuid.equals(tokenTenantUuid)) {
            throw new TenantResolutionException(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unauthorized",
                    "Tenant header does not match JWT tenant."
            );
        }

        UUID resolvedTenantUuid = tokenTenantUuid != null
                ? tokenTenantUuid
                : (headerTenantUuid != null ? headerTenantUuid : defaultTenantUuid);

        Tenant tenant = tenantRepository.findByUuid(resolvedTenantUuid)
                .orElseThrow(() -> new TenantResolutionException(
                        HttpServletResponse.SC_BAD_REQUEST,
                        "Bad Request",
                        "Tenant not found for id: " + resolvedTenantUuid
                ));

        if (Boolean.FALSE.equals(tenant.getActive())) {
            throw new TenantResolutionException(
                    HttpServletResponse.SC_FORBIDDEN,
                    "Forbidden",
                    "Tenant is inactive: " + resolvedTenantUuid
            );
        }

        return resolvedTenantUuid;
    }

    private UUID resolveFromHeader(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(headerValue.trim());
        } catch (IllegalArgumentException ex) {
            throw new TenantResolutionException(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Bad Request",
                    "Invalid tenant header. Expected UUID in " + tenantHeaderName + "."
            );
        }
    }

    private UUID resolveFromToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String jwt = authorizationHeader.substring(7).trim();
        if (jwt.isBlank()) {
            throw new TenantResolutionException(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unauthorized",
                    "Bearer token is empty."
            );
        }

        try {
            UUID tenantUuid = jwtService.extractTenantUuid(jwt);
            if (tenantUuid == null) {
                throw new TenantResolutionException(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Unauthorized",
                        "JWT token does not contain tenant information."
                );
            }
            return tenantUuid;
        } catch (IllegalArgumentException ex) {
            throw new TenantResolutionException(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Unauthorized",
                    "Invalid JWT token."
            );
        }
    }
}
