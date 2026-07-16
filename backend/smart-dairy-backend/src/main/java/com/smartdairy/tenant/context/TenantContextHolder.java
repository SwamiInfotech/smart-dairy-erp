package com.smartdairy.tenant.context;

import java.util.UUID;

public final class TenantContextHolder {

    public static final UUID FALLBACK_TENANT_UUID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private static final ThreadLocal<UUID> TENANT_UUID = new ThreadLocal<>();

    private TenantContextHolder() {
    }

    public static void setTenantUuid(UUID tenantUuid) {
        TENANT_UUID.set(tenantUuid);
    }

    public static UUID getTenantUuid() {
        return TENANT_UUID.get();
    }

    public static UUID getTenantUuidOrFallback() {
        UUID tenantUuid = TENANT_UUID.get();
        return tenantUuid == null ? FALLBACK_TENANT_UUID : tenantUuid;
    }

    public static void clear() {
        TENANT_UUID.remove();
    }
}
