package com.example.eduaiplatform.security;

import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private static final String TEST_SECRET = "test-secret-key-with-at-least-32-bytes";

    @Test
    void generateToken_containsUsernameAndValidatesForSameUser() {
        JwtService jwtService = new JwtService(TEST_SECRET, 60_000);
        UserPrincipal principal = principal(7L, "student@example.com", RoleName.ROLE_USER);

        String token = jwtService.generateToken(principal);

        assertEquals("student@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, principal));
    }

    @Test
    void isTokenValid_rejectsDifferentUser() {
        JwtService jwtService = new JwtService(TEST_SECRET, 60_000);
        UserPrincipal owner = principal(7L, "owner@example.com", RoleName.ROLE_USER);
        UserPrincipal otherUser = principal(8L, "other@example.com", RoleName.ROLE_USER);

        String token = jwtService.generateToken(owner);

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    private UserPrincipal principal(Long id, String email, RoleName roleName) {
        User user = new User("Test User", email, "hashed-password", new Role(roleName));
        ReflectionTestUtils.setField(user, "id", id);
        return new UserPrincipal(user);
    }
}
