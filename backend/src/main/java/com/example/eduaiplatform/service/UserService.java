package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getCurrentUser();
    Page<UserResponse> getUsers(Pageable pageable);
}
