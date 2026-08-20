package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.request.EmailRequest;
import com.example.eduaiplatform.dto.request.GoogleLoginRequest;
import com.example.eduaiplatform.dto.request.LoginRequest;
import com.example.eduaiplatform.dto.request.RegisterRequest;
import com.example.eduaiplatform.dto.request.ResetPasswordRequest;
import com.example.eduaiplatform.dto.response.ApiResponse;
import com.example.eduaiplatform.dto.response.AuthMessageResponse;
import com.example.eduaiplatform.dto.response.AuthResponse;
import com.example.eduaiplatform.dto.response.UserResponse;
import com.example.eduaiplatform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthMessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registration successful. Check your email to verify your account.", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successful", authService.login(request));
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request) {
        return ApiResponse.success("Login successful", authService.googleLogin(request));
    }

    @PostMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ApiResponse.success("Email verified. You can sign in now.", null);
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request);
        return ApiResponse.success("If the account exists and needs verification, a new email has been sent.", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody EmailRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("If the email exists, a password reset link has been sent.", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password updated. You can sign in now.", null);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success("Current user", authService.currentUser());
    }
}
