package com.smartdairy.security.jwt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.security.jwt.secret:smart-dairy-super-secret-key-change-me}")
    private String secret;

    @Value("${app.security.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public String generateToken(String username, String role) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + (expirationMs / 1000);

            Map<String, Object> header = Map.of(
                    "alg", "HS256",
                    "typ", "JWT"
            );

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", username);
            payload.put("role", role);
            payload.put("iat", now);
            payload.put("exp", exp);

            String headerPart = base64UrlEncode(objectMapper.writeValueAsBytes(header));
            String payloadPart = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
            String signingInput = headerPart + "." + payloadPart;
            String signature = base64UrlEncode(sign(signingInput));
            return signingInput + "." + signature;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate JWT token", ex);
        }
    }

    public String extractUsername(String token) {
        Map<String, Object> claims = parseClaims(token);
        Object value = claims.get("sub");
        return value == null ? "" : String.valueOf(value);
    }

    public String extractRole(String token) {
        Map<String, Object> claims = parseClaims(token);
        Object value = claims.get("role");
        return value == null ? "" : String.valueOf(value);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return userDetails.getUsername().equalsIgnoreCase(username) && !isTokenExpired(token) && isSignatureValid(token);
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000;
    }

    private boolean isTokenExpired(String token) {
        Map<String, Object> claims = parseClaims(token);
        Object expObj = claims.get("exp");
        if (expObj == null) {
            return true;
        }

        long exp = Long.parseLong(String.valueOf(expObj));
        return Instant.now().getEpochSecond() >= exp;
    }

    private Map<String, Object> parseClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid token");
            }

            if (!isSignatureValid(token)) {
                throw new IllegalArgumentException("Invalid signature");
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(payloadBytes, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to parse token", ex);
        }
    }

    private boolean isSignatureValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String signingInput = parts[0] + "." + parts[1];
            byte[] expected = sign(signingInput);
            byte[] actual = Base64.getUrlDecoder().decode(parts[2]);
            return java.security.MessageDigest.isEqual(expected, actual);
        } catch (Exception ex) {
            return false;
        }
    }

    private byte[] sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
