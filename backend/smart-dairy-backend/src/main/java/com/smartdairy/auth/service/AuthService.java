package com.smartdairy.auth.service;

import com.smartdairy.auth.dto.AuthTokenResponse;
import com.smartdairy.auth.dto.LoginRequest;
import com.smartdairy.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthTokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        String token = jwtService.generateToken(authentication.getName(), role);

        return new AuthTokenResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                authentication.getName(),
                role
        );
    }
}
