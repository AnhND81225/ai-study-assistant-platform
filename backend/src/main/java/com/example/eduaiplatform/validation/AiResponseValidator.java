package com.example.eduaiplatform.validation;

import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.entity.AiQuestionType;
import com.example.eduaiplatform.entity.AiResultStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class AiResponseValidator {
    private final ObjectMapper objectMapper;

    public AiResponseValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void validateCompletion(JsonNode root) {
        String finishReason = root.path("choices").path(0).path("finish_reason").asText("");
        if ("length".equals(finishReason)) {
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    ErrorCode.AI_RESPONSE_TRUNCATED,
                    "The answer was too long to complete. Try again or add a shorter, more specific note."
            );
        }
    }

    /**
     * Validates fields according to the AI result state. A real or partial solution
     * must contain an explanation and final answer, while selection and incomplete
     * states intentionally carry guidance instead of pretending to be a solution.
     */
    public ExplanationPayload validateExplanation(JsonNode parsed) {
        rejectInputConflict(parsed);
        AiQuestionType questionType = requiredEnum(parsed, "questionType", AiQuestionType.class);
        AiResultStatus resultStatus = requiredEnum(parsed, "resultStatus", AiResultStatus.class);
        String detectedQuestion = requiredText(parsed, "detectedQuestion");
        String explanation = optionalText(parsed, "explanation");
        String finalAnswer = optionalText(parsed, "finalAnswer");
        List<Integer> availableQuestions = integerArray(parsed, "availableQuestions");
        Integer selectedQuestionNumber = optionalPositiveInteger(parsed, "selectedQuestionNumber");

        if (resultStatus == AiResultStatus.SOLUTION_READY || resultStatus == AiResultStatus.PARTIAL_RESULT) {
            if (explanation.isBlank() || finalAnswer.isBlank()) {
                throw invalidResponse();
            }
            rejectNestedJson(finalAnswer);
        }
        if (resultStatus == AiResultStatus.QUESTION_SELECTION_REQUIRED && availableQuestions.isEmpty()) {
            throw invalidResponse();
        }
        if (explanation.isBlank() && resultStatus == AiResultStatus.QUESTION_SELECTION_REQUIRED) {
            explanation = "Choose one of the detected question numbers to continue.";
        }
        if (explanation.isBlank() && resultStatus == AiResultStatus.INCOMPLETE_IMAGE) {
            explanation = "The selected question could not be read completely from this image.";
        }

        return new ExplanationPayload(
                detectedQuestion,
                explanation,
                finalAnswer,
                optionalText(parsed, "inputWarning"),
                questionType,
                resultStatus,
                availableQuestions,
                selectedQuestionNumber
        );
    }

    public GradingPayload validateGrading(JsonNode parsed, boolean answerDetectionRequired) {
        int score = parsed.path("score").asInt(-1);
        if (score < 0 || score > 100) {
            throw invalidResponse();
        }
        String detectedStudentAnswer = answerDetectionRequired
                ? requiredText(parsed, "detectedStudentAnswer")
                : optionalText(parsed, "detectedStudentAnswer");
        return new GradingPayload(
                score,
                detectedStudentAnswer,
                requiredText(parsed, "feedback"),
                optionalText(parsed, "mistakes"),
                optionalText(parsed, "improvementSuggestions")
        );
    }

    public List<QuestionSolutionPayload> validateQuestionSolutions(JsonNode parsed, List<Integer> requestedNumbers) {
        JsonNode solutions = parsed.path("solutions");
        if (!solutions.isArray() || solutions.size() != requestedNumbers.size()) {
            throw invalidResponse();
        }

        Set<Integer> requested = new HashSet<>(requestedNumbers);
        Set<Integer> returned = new HashSet<>();
        List<QuestionSolutionPayload> result = new ArrayList<>();
        solutions.forEach(solution -> {
            int questionNumber = solution.path("questionNumber").asInt(-1);
            if (!requested.contains(questionNumber) || !returned.add(questionNumber)) {
                throw invalidResponse();
            }
            result.add(new QuestionSolutionPayload(
                    questionNumber,
                    requiredText(solution, "detectedQuestion"),
                    requiredText(solution, "explanation"),
                    requiredText(solution, "finalAnswer")
            ));
        });
        return result.stream().sorted((left, right) -> Integer.compare(left.questionNumber(), right.questionNumber())).toList();
    }

    public NewWorkPayload validateNewWork(JsonNode parsed) {
        rejectInputConflict(parsed);
        GradingPayload grading = validateGrading(parsed, true);
        String finalAnswer = requiredText(parsed, "finalAnswer");
        rejectNestedJson(finalAnswer);
        return new NewWorkPayload(
                requiredText(parsed, "detectedQuestion"),
                requiredText(parsed, "expectedExplanation"),
                finalAnswer,
                grading.detectedStudentAnswer(),
                grading.score(),
                grading.feedback(),
                grading.mistakes(),
                grading.improvementSuggestions(),
                optionalText(parsed, "inputWarning")
        );
    }

    private void rejectInputConflict(JsonNode parsed) {
        if (parsed.path("inputConflict").asBoolean(false)) {
            throw new ApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    ErrorCode.AI_INPUT_CONFLICT,
                    "The uploaded image and note describe different questions. Review the note or remove it, then try again."
            );
        }
    }

    private String requiredText(JsonNode parsed, String field) {
        JsonNode value = parsed.path(field);
        if (!value.isTextual() || value.asText().isBlank()) {
            throw invalidResponse();
        }
        return value.asText().trim();
    }

    private String optionalText(JsonNode parsed, String field) {
        JsonNode value = parsed.path(field);
        return value.isTextual() ? value.asText("").trim() : "";
    }

    private <T extends Enum<T>> T requiredEnum(JsonNode parsed, String field, Class<T> enumType) {
        try {
            return Enum.valueOf(enumType, requiredText(parsed, field).toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw invalidResponse();
        }
    }

    private List<Integer> integerArray(JsonNode parsed, String field) {
        JsonNode value = parsed.path(field);
        if (!value.isArray()) {
            return List.of();
        }
        List<Integer> numbers = new ArrayList<>();
        value.forEach(item -> {
            if (item.canConvertToInt() && item.asInt() > 0) {
                numbers.add(item.asInt());
            }
        });
        return numbers.stream().distinct().sorted().toList();
    }

    private Integer optionalPositiveInteger(JsonNode parsed, String field) {
        JsonNode value = parsed.path(field);
        return value.canConvertToInt() && value.asInt() > 0 ? value.asInt() : null;
    }

    private void rejectNestedJson(String value) {
        String normalized = value.trim();
        if (normalized.startsWith("```json")) {
            normalized = normalized.substring(7).replaceFirst("```\\s*$", "").trim();
        }
        if (!normalized.startsWith("{")) {
            return;
        }
        try {
            JsonNode nested = objectMapper.readTree(normalized);
            if (nested.isObject() && (
                    nested.has("detectedQuestion")
                            || nested.has("explanation")
                            || nested.has("finalAnswer")
            )) {
                throw invalidResponse();
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ignored) {
            // Ordinary answer text may start with a brace; invalid JSON is not treated as a nested response.
        }
    }

    private ApiException invalidResponse() {
        return new ApiException(
                HttpStatus.BAD_GATEWAY,
                ErrorCode.AI_RESPONSE_PARSE_ERROR,
                "We could not prepare the AI response correctly. Please try again."
        );
    }

    public record ExplanationPayload(
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String inputWarning,
            AiQuestionType questionType,
            AiResultStatus resultStatus,
            List<Integer> availableQuestions,
            Integer selectedQuestionNumber
    ) {
    }

    public record GradingPayload(
            int score,
            String detectedStudentAnswer,
            String feedback,
            String mistakes,
            String improvementSuggestions
    ) {
    }

    public record NewWorkPayload(
            String detectedQuestion,
            String expectedExplanation,
            String finalAnswer,
            String detectedStudentAnswer,
            int score,
            String feedback,
            String mistakes,
            String improvementSuggestions,
            String inputWarning
    ) {
    }

    public record QuestionSolutionPayload(
            Integer questionNumber,
            String detectedQuestion,
            String explanation,
            String finalAnswer
    ) {
    }
}
