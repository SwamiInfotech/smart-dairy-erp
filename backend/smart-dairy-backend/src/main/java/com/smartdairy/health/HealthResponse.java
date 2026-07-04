package com.smartdairy.health;

public record HealthResponse(
        String status,
        String application,
        String version
) {
}