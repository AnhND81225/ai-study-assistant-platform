package com.example.eduaiplatform.mapper;

import com.example.eduaiplatform.dto.response.UserResponse;
import com.example.eduaiplatform.entity.User;

public final class UserMapper {
    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName().name(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
