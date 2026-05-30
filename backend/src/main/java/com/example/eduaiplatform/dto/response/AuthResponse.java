package com.example.eduaiplatform.dto.response;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
