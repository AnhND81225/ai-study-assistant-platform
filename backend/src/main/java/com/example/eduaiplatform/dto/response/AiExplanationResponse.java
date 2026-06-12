package com.example.eduaiplatform.dto.response;

import java.util.List;

public record AiExplanationResponse(
        Long id,
        String detectedQuestion,
        String explanation,
        String finalAnswer,
        String inputWarning,
        String questionType,
        String resultStatus,
        String solveMode,
        List<Integer> availableQuestions,
        Integer selectedQuestionNumber,
        String modelName
) {
}
