package com.example.eduaiplatform.dto.response;

import java.time.Instant;

public record QuestionSolutionResponse(
        Long id,
        Integer questionNumber,
        String detectedQuestion,
        String explanation,
        String finalAnswer,
        String modelName,
        Instant createdAt
) {
}
