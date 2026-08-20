package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.MailProperties;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;
    private final String mailHost;

    public SmtpEmailServiceImpl(JavaMailSender mailSender, MailProperties mailProperties, @Value("${spring.mail.host:}") String mailHost) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
        this.mailHost = mailHost;
    }

    @Override
    public void sendVerificationEmail(User user, String verificationUrl) {
        send(user.getEmail(), "Verify your StudyAI email", """
                Hi %s,

                Please verify your StudyAI account by opening this link:
                %s

                If you did not create this account, you can ignore this email.
                """.formatted(user.getFullName(), verificationUrl));
    }

    @Override
    public void sendPasswordResetEmail(User user, String resetUrl) {
        send(user.getEmail(), "Reset your StudyAI password", """
                Hi %s,

                Reset your StudyAI password by opening this link:
                %s

                If you did not request this, you can ignore this email.
                """.formatted(user.getFullName(), resetUrl));
    }

    private void send(String to, String subject, String text) {
        if (mailHost == null || mailHost.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.EMAIL_DELIVERY_FAILED, "Email delivery is not configured");
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailProperties.getFrom());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (MailException ex) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.EMAIL_DELIVERY_FAILED, "Email delivery failed");
        }
    }
}
