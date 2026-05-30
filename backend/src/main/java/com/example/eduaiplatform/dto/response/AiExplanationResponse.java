package com.example.eduaiplatform.dto.response;

public record AiExplanationResponse(
        Long id,
        String detectedQuestion,
        String explanation,
        String finalAnswer,
        String modelName
) {
}
