package com.smartdairy.tenant.context;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@Slf4j
public class TenantRepositoryFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("execution(* com.smartdairy..repository..*(..))"
            + " && !within(com.smartdairy.tenant.repository..*)")
    public Object applyTenantFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        Session session = entityManager.unwrap(Session.class);
        Filter activeFilter = session.getEnabledFilter("tenantFilter");
        boolean enabledByAspect = false;

        if (activeFilter == null) {
            UUID tenantUuid = TenantContextHolder.getTenantUuidOrFallback();
            session.enableFilter("tenantFilter")
                    .setParameter("tenantUuid", tenantUuid);
            enabledByAspect = true;
            log.trace("Enabled tenantFilter={} for {}", tenantUuid, joinPoint.getSignature());
        }

        try {
            return joinPoint.proceed();
        } finally {
            if (enabledByAspect) {
                session.disableFilter("tenantFilter");
            }
        }
    }
}
