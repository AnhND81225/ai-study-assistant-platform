package com.example.eduaiplatform.dto.response;

import java.time.Instant;

public record GradingResultResponse(
        Long id,
        String userAnswer,
        String userAnswerImageUrl,
        Integer questionNumber,
        Integer score,
        String feedback,
        String mistakes,
        String improvementSuggestions,
        Instant createdAt
) {
}
