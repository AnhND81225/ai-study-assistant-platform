package com.example.eduaiplatform.dto.response;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean enabled,
        boolean emailVerified,
        String authProvider,
        Instant createdAt
) {
}
