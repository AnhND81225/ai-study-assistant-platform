package com.example.eduaiplatform.service;

import com.example.eduaiplatform.entity.AiQuestionType;
import com.example.eduaiplatform.entity.AiResultStatus;
import com.example.eduaiplatform.entity.AiSolveMode;

import java.util.List;

public interface AiService {
    AiExplanationResult explain(String imageUrl, String subjectName, String note, Integer questionNumber, AiSolveMode solveMode);
    AiQuestionBatchResult explainQuestions(String imageUrl, String subjectName, String note, List<Integer> questionNumbers);
    AiGradingResult grade(String detectedQuestion, String explanation, String finalAnswer, String userAnswer);
    AiGradingResult gradeImage(String detectedQuestion, String explanation, String finalAnswer, String studentAnswerImageUrl);
    AiNewWorkGradingResult gradeNewWorkImage(String imageUrl, String subjectName, String note);

    record AiExplanationResult(
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String inputWarning,
            AiQuestionType questionType,
            AiResultStatus resultStatus,
            AiSolveMode solveMode,
            List<Integer> availableQuestions,
            Integer selectedQuestionNumber,
            String modelName,
            Integer inputTokens,
            Integer outputTokens
    ) {
    }

    record AiQuestionSolutionResult(
            Integer questionNumber,
            String detectedQuestion,
            String explanation,
            String finalAnswer
    ) {
    }

    record AiQuestionBatchResult(
            List<AiQuestionSolutionResult> solutions,
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
            String inputWarning,
            String modelName,
            Integer inputTokens,
            Integer outputTokens
    ) {
    }
}
