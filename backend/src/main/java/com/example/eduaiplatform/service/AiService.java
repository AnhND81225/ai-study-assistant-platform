package com.example.eduaiplatform.service;

public interface AiService {
    AiExplanationResult explain(String imageUrl, String subjectName, String note);
    AiGradingResult grade(String detectedQuestion, String explanation, String finalAnswer, String userAnswer);

    record AiExplanationResult(
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String modelName,
            Integer inputTokens,
            Integer outputTokens
    ) {
    }

    record AiGradingResult(
            Integer score,
            String feedback,
            String mistakes,
            String improvementSuggestions,
            String modelName,
            Integer inputTokens,
            Integer outputTokens
    ) {
    }
}
