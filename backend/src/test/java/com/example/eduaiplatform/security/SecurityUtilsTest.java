package com.example.eduaiplatform.security;

import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityUtilsTest {
    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentUserId_returnsAuthenticatedPrincipalId() {
        authenticate(12L, "student@example.com", RoleName.ROLE_USER);

        assertEquals(12L, SecurityUtils.currentUserId());
        assertFalse(SecurityUtils.isAdmin());
    }

    @Test
    void isAdmin_detectsAdminRole() {
        authenticate(1L, "admin@example.com", RoleName.ROLE_ADMIN);

        assertTrue(SecurityUtils.isAdmin());
    }

    @Test
    void currentUser_throwsWhenAuthenticationIsMissing() {
        ApiException exception = assertThrows(ApiException.class, SecurityUtils::currentUser);

        assertEquals(ErrorCode.AUTHENTICATION_FAILED, exception.getErrorCode());
    }

    private void authenticate(Long id, String email, RoleName roleName) {
        User user = new User("Test User", email, "hashed-password", new Role(roleName));
        ReflectionTestUtils.setField(user, "id", id);
        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }
}
