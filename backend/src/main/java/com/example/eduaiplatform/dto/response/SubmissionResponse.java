package com.example.eduaiplatform.dto.response;

import java.time.Instant;
import java.util.List;

public record SubmissionResponse(
        Long id,
        Long userId,
        String userEmail,
        SubjectResponse subject,
        String imageUrl,
        String originalFileName,
        String title,
        String status,
        String note,
        boolean favorite,
        AiExplanationResponse aiResponse,
        List<GradingResultResponse> gradingResults,
        Instant createdAt,
        Instant updatedAt
) {
}
