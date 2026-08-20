package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.AuthProperties;
import com.example.eduaiplatform.dto.request.EmailRequest;
import com.example.eduaiplatform.dto.request.GoogleLoginRequest;
import com.example.eduaiplatform.dto.request.LoginRequest;
import com.example.eduaiplatform.dto.request.RegisterRequest;
import com.example.eduaiplatform.dto.request.ResetPasswordRequest;
import com.example.eduaiplatform.dto.response.GoogleTokenInfoResponse;
import com.example.eduaiplatform.entity.AuthProvider;
import com.example.eduaiplatform.entity.EmailVerificationToken;
import com.example.eduaiplatform.entity.PasswordResetToken;
import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.repository.EmailVerificationTokenRepository;
import com.example.eduaiplatform.repository.PasswordResetTokenRepository;
import com.example.eduaiplatform.repository.RoleRepository;
import com.example.eduaiplatform.repository.UserRepository;
import com.example.eduaiplatform.security.JwtService;
import com.example.eduaiplatform.service.EmailService;
import com.example.eduaiplatform.service.GoogleTokenVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    private JwtService realJwtService;
    @Mock
    private EmailService emailService;
    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        AuthProperties authProperties = new AuthProperties();
        authProperties.setFrontendUrl("https://studyai.example");
        authProperties.setEmailVerificationMinutes(60);
        authProperties.setPasswordResetMinutes(15);
        realJwtService = new JwtService("test-jwt-secret-test-jwt-secret-test-jwt-secret", 3600000);
        service = new AuthServiceImpl(
                userRepository,
                roleRepository,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                passwordEncoder,
                authenticationManager,
                realJwtService,
                emailService,
                googleTokenVerifier,
                authProperties
        );
    }

    @Test
    void register_createsUnverifiedLocalUserAndSendsVerificationEmail() {
        when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(new Role(RoleName.ROLE_USER)));
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.register(new RegisterRequest("Student One", " Student@Example.COM ", "password123"));

        assertEquals("student@example.com", response.email());
        assertTrue(response.nextStep().contains("verify"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("student@example.com", savedUser.getEmail());
        assertFalse(savedUser.isEmailVerified());
        assertEquals(AuthProvider.LOCAL, savedUser.getAuthProvider());

        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(emailVerificationTokenRepository).save(tokenCaptor.capture());
        assertEquals(64, tokenCaptor.getValue().getTokenHash().length());

        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendVerificationEmail(eq(savedUser), linkCaptor.capture());
        assertTrue(linkCaptor.getValue().startsWith("https://studyai.example/verify-email?token="));
        assertFalse(linkCaptor.getValue().contains(tokenCaptor.getValue().getTokenHash()));
    }

    @Test
    void login_blocksUnverifiedLocalAccountBeforeIssuingJwt() {
        User user = localUser(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("student@example.com", "password123"));
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(user));

        ApiException exception = assertThrows(ApiException.class,
                () -> service.login(new LoginRequest("Student@Example.COM", "password123")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        assertEquals(ErrorCode.EMAIL_NOT_VERIFIED, exception.getErrorCode());
    }

    @Test
    void verifyEmail_marksValidTokenAsUsedAndVerified() {
        User user = localUser(false);
        EmailVerificationToken token = new EmailVerificationToken(
                sha256("valid-token"),
                user,
                Instant.now().plusSeconds(300)
        );
        when(emailVerificationTokenRepository.findByTokenHash(sha256("valid-token"))).thenReturn(Optional.of(token));

        service.verifyEmail("valid-token");

        assertTrue(user.isEmailVerified());
        assertNotNull(token.getUsedAt());
    }

    @Test
    void forgotPassword_doesNotRevealUnknownEmail() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        service.forgotPassword(new EmailRequest("missing@example.com"));

        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(any(), anyString());
    }

    @Test
    void resetPassword_rejectsExpiredToken() {
        User user = localUser(true);
        PasswordResetToken token = new PasswordResetToken(
                sha256("expired-token"),
                user,
                Instant.now().minusSeconds(60)
        );
        when(passwordResetTokenRepository.findByTokenHash(sha256("expired-token"))).thenReturn(Optional.of(token));

        ApiException exception = assertThrows(ApiException.class,
                () -> service.resetPassword(new ResetPasswordRequest("expired-token", "newPassword123")));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals(ErrorCode.TOKEN_EXPIRED, exception.getErrorCode());
        verify(passwordEncoder, never()).encode("newPassword123");
    }

    @Test
    void resetPassword_updatesPasswordAndMarksAccountVerified() {
        User user = localUser(false);
        PasswordResetToken token = new PasswordResetToken(
                sha256("valid-reset-token"),
                user,
                Instant.now().plusSeconds(300)
        );
        when(passwordResetTokenRepository.findByTokenHash(sha256("valid-reset-token"))).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPassword123")).thenReturn("new-hash");

        service.resetPassword(new ResetPasswordRequest("valid-reset-token", "newPassword123"));

        assertEquals("new-hash", user.getPasswordHash());
        assertTrue(user.isEmailVerified());
        assertNotNull(token.getUsedAt());
    }

    @Test
    void googleLogin_createsVerifiedUserAndIssuesJwt() {
        GoogleTokenInfoResponse tokenInfo = new GoogleTokenInfoResponse(
                "google-client-id",
                "google-subject",
                "student@example.com",
                true,
                "Student One"
        );
        when(googleTokenVerifier.verify("google-credential")).thenReturn(tokenInfo);
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(new Role(RoleName.ROLE_USER)));
        when(passwordEncoder.encode(anyString())).thenReturn("generated-password-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.googleLogin(new GoogleLoginRequest("google-credential"));

        assertNotNull(response.token());
        assertFalse(response.token().isBlank());
        assertEquals("student@example.com", response.user().email());
        assertTrue(response.user().emailVerified());
        assertEquals("GOOGLE", response.user().authProvider());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals(AuthProvider.GOOGLE, savedUser.getAuthProvider());
        assertTrue(savedUser.isEmailVerified());
        assertEquals("google-subject", savedUser.getProviderSubject());
        assertNotEquals("google-credential", savedUser.getPasswordHash());
    }

    private User localUser(boolean verified) {
        User user = new User("Student One", "student@example.com", "encoded-password", new Role(RoleName.ROLE_USER));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(verified);
        return user;
    }

    private String sha256(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
