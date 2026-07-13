package com.smartdairy.auth.dto;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String username,
        String role
) {
}
