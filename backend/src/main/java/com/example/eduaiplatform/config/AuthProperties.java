package com.example.eduaiplatform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {
    private String frontendUrl = "http://localhost:5173";
    private long emailVerificationMinutes = 1440;
    private long passwordResetMinutes = 15;

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public long getEmailVerificationMinutes() {
        return emailVerificationMinutes;
    }

    public void setEmailVerificationMinutes(long emailVerificationMinutes) {
        this.emailVerificationMinutes = emailVerificationMinutes;
    }

    public long getPasswordResetMinutes() {
        return passwordResetMinutes;
    }

    public void setPasswordResetMinutes(long passwordResetMinutes) {
        this.passwordResetMinutes = passwordResetMinutes;
    }
}
