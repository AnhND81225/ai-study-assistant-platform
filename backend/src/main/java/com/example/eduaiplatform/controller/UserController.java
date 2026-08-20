package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.response.ApiResponse;
import com.example.eduaiplatform.dto.response.PageResponse;
import com.example.eduaiplatform.dto.response.UserResponse;
import com.example.eduaiplatform.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/api/users/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success("Current user", userService.getCurrentUser());
    }

    @GetMapping("/api/admin/users")
    public ApiResponse<PageResponse<UserResponse>> users(Pageable pageable) {
        return ApiResponse.success("Users", PageResponse.from(userService.getUsers(pageable)));
    }
}
