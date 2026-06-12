package com.example.eduaiplatform.validation;

import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

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

    public ExplanationPayload validateExplanation(JsonNode parsed) {
        rejectInputConflict(parsed);
        String detectedQuestion = requiredText(parsed, "detectedQuestion");
        String explanation = requiredText(parsed, "explanation");
        String finalAnswer = requiredText(parsed, "finalAnswer");
        rejectNestedJson(finalAnswer);
        return new ExplanationPayload(
                detectedQuestion,
                explanation,
                finalAnswer,
                optionalText(parsed, "inputWarning")
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
            String inputWarning
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
}
