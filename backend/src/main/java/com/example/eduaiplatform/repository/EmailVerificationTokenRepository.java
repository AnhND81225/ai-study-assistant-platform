package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.EmailVerificationToken;
import com.example.eduaiplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    void deleteByUserAndUsedAtIsNull(User user);
}
