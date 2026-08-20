package com.example.eduaiplatform.service;

import com.example.eduaiplatform.entity.User;

public interface EmailService {
    void sendVerificationEmail(User user, String verificationUrl);

    void sendPasswordResetEmail(User user, String resetUrl);
}
