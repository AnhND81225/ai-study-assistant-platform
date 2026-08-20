package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.request.EmailRequest;
import com.example.eduaiplatform.dto.request.GoogleLoginRequest;
import com.example.eduaiplatform.dto.request.LoginRequest;
import com.example.eduaiplatform.dto.request.RegisterRequest;
import com.example.eduaiplatform.dto.request.ResetPasswordRequest;
import com.example.eduaiplatform.dto.response.AuthMessageResponse;
import com.example.eduaiplatform.dto.response.AuthResponse;
import com.example.eduaiplatform.dto.response.UserResponse;

public interface AuthService {
    AuthMessageResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleLoginRequest request);
    void verifyEmail(String token);
    void resendVerification(EmailRequest request);
    void forgotPassword(EmailRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse currentUser();
}
