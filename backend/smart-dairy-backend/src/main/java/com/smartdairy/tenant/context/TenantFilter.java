package com.smartdairy.tenant.context;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartdairy.common.response.ErrorResponse;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantFilter extends OncePerRequestFilter {

    private final EntityManager entityManager;
    private final TenantResolver tenantResolver;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Session session = entityManager.unwrap(Session.class);
        boolean tenantFilterEnabled = false;

        try {
            UUID tenantUuid = tenantResolver.resolveTenantUuid(request);
            TenantContextHolder.setTenantUuid(tenantUuid);
            session.enableFilter("tenantFilter")
                    .setParameter("tenantUuid", tenantUuid);
            tenantFilterEnabled = true;
            filterChain.doFilter(request, response);
        } catch (TenantResolutionException ex) {
            ErrorResponse body = new ErrorResponse(
                    OffsetDateTime.now(),
                    ex.getStatus(),
                    ex.getError(),
                    ex.getMessage(),
                    request.getRequestURI(),
                    List.of()
            );
            response.setStatus(ex.getStatus());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getOutputStream(), body);
        } finally {
            if (tenantFilterEnabled) {
                session.disableFilter("tenantFilter");
            }
            TenantContextHolder.clear();
        }
    }
}
