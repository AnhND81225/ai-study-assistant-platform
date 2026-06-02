package com.example.eduaiplatform.service;

public interface AiService {
    AiExplanationResult explain(String imageUrl, String subjectName, String note);
    AiGradingResult grade(String detectedQuestion, String explanation, String finalAnswer, String userAnswer);
    AiGradingResult gradeImage(String detectedQuestion, String explanation, String finalAnswer, String studentAnswerImageUrl);
    AiNewWorkGradingResult gradeNewWorkImage(String imageUrl, String subjectName, String note);

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
            String detectedStudentAnswer,
            String feedback,
            String mistakes,
            String improvementSuggestions,
            String modelName,
            Integer inputTokens,
            Integer outputTokens
    ) {
    }

    record AiNewWorkGradingResult(
            String detectedQuestion,
            String expectedExplanation,
            String finalAnswer,
            String detectedStudentAnswer,
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
