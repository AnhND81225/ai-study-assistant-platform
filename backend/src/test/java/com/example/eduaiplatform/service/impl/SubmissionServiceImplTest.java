package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.entity.AiQuestionType;
import com.example.eduaiplatform.entity.AiRequestType;
import com.example.eduaiplatform.entity.AiResponse;
import com.example.eduaiplatform.entity.AiResultStatus;
import com.example.eduaiplatform.entity.AiSolveMode;
import com.example.eduaiplatform.entity.AiUsageStatus;
import com.example.eduaiplatform.entity.GradingResult;
import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.Subject;
import com.example.eduaiplatform.entity.Submission;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.repository.AiResponseRepository;
import com.example.eduaiplatform.repository.AiUsageLogRepository;
import com.example.eduaiplatform.repository.GradingResultRepository;
import com.example.eduaiplatform.repository.SubjectRepository;
import com.example.eduaiplatform.repository.SubmissionRepository;
import com.example.eduaiplatform.repository.UserRepository;
import com.example.eduaiplatform.security.UserPrincipal;
import com.example.eduaiplatform.service.AiService;
import com.example.eduaiplatform.service.CloudinaryService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceImplTest {
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private AiResponseRepository aiResponseRepository;
    @Mock
    private GradingResultRepository gradingResultRepository;
    @Mock
    private AiUsageLogRepository aiUsageLogRepository;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private AiService aiService;

    private SubmissionServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SubmissionServiceImpl(
                submissionRepository,
                userRepository,
                subjectRepository,
                aiResponseRepository,
                gradingResultRepository,
                aiUsageLogRepository,
                cloudinaryService,
                aiService,
                10
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deleteOwnSubmission_forbidsDeletingAnotherUsersSubmission() {
        authenticate(1L, RoleName.ROLE_USER);
        Submission submission = submission(99L, user(2L, RoleName.ROLE_USER), subject(3L), "question-public-id");
        when(submissionRepository.findById(99L)).thenReturn(Optional.of(submission));

        ApiException exception = assertThrows(ApiException.class, () -> service.deleteOwnSubmission(99L));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        assertEquals(ErrorCode.ACCESS_DENIED, exception.getErrorCode());
        verify(submissionRepository, never()).delete(any());
        verify(cloudinaryService, never()).deleteAsset(any());
    }

    @Test
    void deleteOwnSubmission_deletesOwnedSubmissionAndRelatedCloudinaryAssets() {
        authenticate(1L, RoleName.ROLE_USER);
        User owner = user(1L, RoleName.ROLE_USER);
        Submission submission = submission(99L, owner, subject(3L), "question-public-id");
        submission.getGradingResults().add(new GradingResult(
                submission,
                "student answer",
                "https://cdn.example.com/answer.png",
                "answer-public-id",
                90,
                "Good",
                "",
                "Keep going"
        ));
        when(submissionRepository.findById(99L)).thenReturn(Optional.of(submission));

        service.deleteOwnSubmission(99L);

        verify(aiUsageLogRepository).clearSubmissionReference(99L);
        verify(submissionRepository).delete(submission);
        verify(cloudinaryService).deleteAsset("answer-public-id");
        verify(cloudinaryService).deleteAsset("question-public-id");
    }

    @Test
    void explainSubmission_stopsBeforeProviderWhenDailyLimitIsReached() {
        authenticate(1L, RoleName.ROLE_USER);
        User owner = user(1L, RoleName.ROLE_USER);
        Submission submission = submission(99L, owner, subject(3L), "question-public-id");
        when(submissionRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(submission));
        when(aiUsageLogRepository.countByUserIdAndRequestTypeAndStatusAndCreatedAtGreaterThanEqual(
                eq(1L),
                eq(AiRequestType.EXPLAIN),
                eq(AiUsageStatus.SUCCESS),
                any(Instant.class)
        )).thenReturn(10L);

        ApiException exception = assertThrows(ApiException.class, () -> service.explainSubmission(99L, null, AiSolveMode.AUTO));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatus());
        assertEquals(ErrorCode.AI_USAGE_LIMIT_EXCEEDED, exception.getErrorCode());
        verify(aiService, never()).explain(any(), any(), any(), any(), any());
    }

    @Test
    void explainSubmission_rejectsQuestionNumberWithoutOneQuestionMode() {
        authenticate(1L, RoleName.ROLE_USER);
        User owner = user(1L, RoleName.ROLE_USER);
        Submission submission = submission(99L, owner, subject(3L), "question-public-id");
        when(submissionRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(submission));

        ApiException exception = assertThrows(ApiException.class, () -> service.explainSubmission(99L, 2, AiSolveMode.AUTO));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        verify(aiService, never()).explain(any(), any(), any(), any(), any());
    }

    @Test
    void gradeSubmission_requiresSolvedQuestionBeforeGrading() {
        authenticate(1L, RoleName.ROLE_USER);
        User owner = user(1L, RoleName.ROLE_USER);
        Subject subject = subject(3L);
        Submission submission = submission(99L, owner, subject, "question-public-id");
        AiResponse response = new AiResponse(
                submission,
                "Questions 1 and 2",
                "Choose a question first.",
                "",
                "",
                AiQuestionType.MULTI_QUESTION,
                AiResultStatus.QUESTION_SELECTION_REQUIRED,
                AiSolveMode.AUTO,
                List.of(1, 2),
                null,
                "test-model"
        );
        submission.markAiResult(response, AiResultStatus.QUESTION_SELECTION_REQUIRED);
        when(submissionRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(submission));

        ApiException exception = assertThrows(ApiException.class, () -> service.gradeSubmission(
                99L,
                new com.example.eduaiplatform.dto.request.GradeRequest("Student answer")
        ));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        verify(aiService, never()).grade(any(), any(), any(), any());
    }

    private void authenticate(Long id, RoleName roleName) {
        UserPrincipal principal = new UserPrincipal(user(id, roleName));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    private User user(Long id, RoleName roleName) {
        User user = new User("Test User", "user%s@example.com".formatted(id), "hashed-password", new Role(roleName));
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Subject subject(Long id) {
        Subject subject = new Subject("Math", "Math subject");
        ReflectionTestUtils.setField(subject, "id", id);
        return subject;
    }

    private Submission submission(Long id, User user, Subject subject, String publicId) {
        Submission submission = new Submission(
                user,
                subject,
                "https://cdn.example.com/question.png",
                publicId,
                "question.png",
                "note"
        );
        ReflectionTestUtils.setField(submission, "id", id);
        return submission;
    }
}
