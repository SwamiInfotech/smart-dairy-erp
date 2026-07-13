package com.smartdairy.auth.service;

import com.smartdairy.auth.dto.AuthUserResponse;
import com.smartdairy.auth.dto.CreateUserRequest;
import com.smartdairy.auth.entity.AppUser;
import com.smartdairy.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthUserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthUserResponse create(CreateUserRequest request) {
        String username = request.username().trim();
        String fullName = request.fullName().trim();

        if (username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (fullName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }

        if (appUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists: " + username);
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setRole(request.role());
        user.setActive(Boolean.TRUE);

        AppUser saved = appUserRepository.save(user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AuthUserResponse> getAll() {
        return appUserRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private AuthUserResponse toResponse(AppUser user) {
        return new AuthUserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
