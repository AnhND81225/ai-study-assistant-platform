package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.AuthProperties;
import com.example.eduaiplatform.dto.request.EmailRequest;
import com.example.eduaiplatform.dto.request.GoogleLoginRequest;
import com.example.eduaiplatform.dto.request.LoginRequest;
import com.example.eduaiplatform.dto.request.RegisterRequest;
import com.example.eduaiplatform.dto.request.ResetPasswordRequest;
import com.example.eduaiplatform.dto.response.AuthMessageResponse;
import com.example.eduaiplatform.dto.response.AuthResponse;
import com.example.eduaiplatform.dto.response.GoogleTokenInfoResponse;
import com.example.eduaiplatform.dto.response.UserResponse;
import com.example.eduaiplatform.entity.AuthProvider;
import com.example.eduaiplatform.entity.EmailVerificationToken;
import com.example.eduaiplatform.entity.PasswordResetToken;
import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.mapper.UserMapper;
import com.example.eduaiplatform.repository.EmailVerificationTokenRepository;
import com.example.eduaiplatform.repository.PasswordResetTokenRepository;
import com.example.eduaiplatform.repository.RoleRepository;
import com.example.eduaiplatform.repository.UserRepository;
import com.example.eduaiplatform.security.JwtService;
import com.example.eduaiplatform.security.SecurityUtils;
import com.example.eduaiplatform.security.UserPrincipal;
import com.example.eduaiplatform.service.AuthService;
import com.example.eduaiplatform.service.EmailService;
import com.example.eduaiplatform.service.GoogleTokenVerifier;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {
    private static final SecureRandom TOKEN_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final AuthProperties authProperties;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailService emailService,
            GoogleTokenVerifier googleTokenVerifier,
            AuthProperties authProperties
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.authProperties = authProperties;
    }

    @Override
    @Transactional
    public AuthMessageResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Email is already registered");
        }

        User user = new User(
                request.fullName().trim(),
                email,
                passwordEncoder.encode(request.password()),
                defaultUserRole()
        );
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);
        user = userRepository.save(user);

        String token = createEmailVerificationToken(user);
        emailService.sendVerificationEmail(user, buildFrontendUrl("/verify-email", token));

        return new AuthMessageResponse(user.getEmail(), "Check your email to verify your account before signing in.");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED, "Invalid credentials"));
        if (user.getAuthProvider() == AuthProvider.LOCAL && !user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED, "Please verify your email before signing in");
        }
        return issueAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleTokenInfoResponse tokenInfo = googleTokenVerifier.verify(request.credential());
        String email = normalizeEmail(tokenInfo.email());
        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateGoogleProfile(existingUser, tokenInfo))
                .orElseGet(() -> createGoogleUser(tokenInfo, email));
        return issueAuthResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHash(hashToken(token))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_INVALID, "Verification link is invalid"));
        if (verificationToken.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_INVALID, "Verification link has already been used");
        }
        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_EXPIRED, "Verification link has expired");
        }
        verificationToken.getUser().setEmailVerified(true);
        verificationToken.markUsed();
    }

    @Override
    @Transactional
    public void resendVerification(EmailRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(user -> user.getAuthProvider() == AuthProvider.LOCAL)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> {
                    emailVerificationTokenRepository.deleteByUserAndUsedAtIsNull(user);
                    String token = createEmailVerificationToken(user);
                    emailService.sendVerificationEmail(user, buildFrontendUrl("/verify-email", token));
                });
    }

    @Override
    @Transactional
    public void forgotPassword(EmailRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(User::isEnabled)
                .ifPresent(user -> {
                    passwordResetTokenRepository.deleteByUserAndUsedAtIsNull(user);
                    String token = createPasswordResetToken(user);
                    emailService.sendPasswordResetEmail(user, buildFrontendUrl("/reset-password", token));
                });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_INVALID, "Password reset link is invalid"));
        if (resetToken.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_INVALID, "Password reset link has already been used");
        }
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TOKEN_EXPIRED, "Password reset link has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setEmailVerified(true);
        resetToken.markUsed();
    }

    @Override
    public UserResponse currentUser() {
        Long id = SecurityUtils.currentUserId();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        return UserMapper.toResponse(user);
    }

    private User updateGoogleProfile(User user, GoogleTokenInfoResponse tokenInfo) {
        user.setEmailVerified(true);
        user.setProviderSubject(tokenInfo.sub());
        if (user.getAuthProvider() == null) {
            user.setAuthProvider(AuthProvider.GOOGLE);
        }
        if (tokenInfo.name() != null && !tokenInfo.name().isBlank()) {
            user.setFullName(tokenInfo.name().trim());
        }
        return user;
    }

    private User createGoogleUser(GoogleTokenInfoResponse tokenInfo, String email) {
        String displayName = tokenInfo.name() == null || tokenInfo.name().isBlank()
                ? email.substring(0, email.indexOf('@'))
                : tokenInfo.name().trim();
        User user = new User(displayName, email, passwordEncoder.encode(generateToken()), defaultUserRole());
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setProviderSubject(tokenInfo.sub());
        user.setEmailVerified(true);
        return user;
    }

    private AuthResponse issueAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return new AuthResponse(jwtService.generateToken(principal), UserMapper.toResponse(user));
    }

    private Role defaultUserRole() {
        return roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Default user role is missing"));
    }

    private String createEmailVerificationToken(User user) {
        String token = generateToken();
        Instant expiresAt = Instant.now().plus(authProperties.getEmailVerificationMinutes(), ChronoUnit.MINUTES);
        emailVerificationTokenRepository.save(new EmailVerificationToken(hashToken(token), user, expiresAt));
        return token;
    }

    private String createPasswordResetToken(User user) {
        String token = generateToken();
        Instant expiresAt = Instant.now().plus(authProperties.getPasswordResetMinutes(), ChronoUnit.MINUTES);
        passwordResetTokenRepository.save(new PasswordResetToken(hashToken(token), user, expiresAt));
        return token;
    }

    private String buildFrontendUrl(String path, String token) {
        String baseUrl = authProperties.getFrontendUrl().replaceAll("/+$", "");
        return baseUrl + path + "?token=" + token;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        TOKEN_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Token hashing is unavailable");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
