package com.smartdairy.config;

import com.smartdairy.tenant.context.TenantContextHolder;

import java.math.BigDecimal;
import java.util.UUID;

public final class CacheKeys {

    private CacheKeys() {
    }

    public static String tenantKey() {
        return TenantContextHolder.getTenantUuidOrFallback().toString();
    }

    public static String tenantRecordKey(UUID uuid) {
        return tenantKey() + ":" + uuid;
    }

    public static String milkRateChartFatRateKey(Long chartId, BigDecimal fat, BigDecimal snf) {
        return tenantKey() + ":" + chartId + ":" + normalizeDecimal(fat) + ":" + normalizeDecimal(snf);
    }

    public static String milkRateChartMavaRateKey(Long chartId, BigDecimal mava) {
        return tenantKey() + ":" + chartId + ":" + mava.stripTrailingZeros().toPlainString();
    }

    private static String normalizeDecimal(BigDecimal value) {
        if (value == null) {
            return "null";
        }

        return value.stripTrailingZeros().toPlainString();
    }
}
