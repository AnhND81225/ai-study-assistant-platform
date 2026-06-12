package com.example.eduaiplatform.validation;

import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AiResponseValidatorTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private AiResponseValidator validator;

    @BeforeEach
    void setUp() {
        validator = new AiResponseValidator(objectMapper);
    }

    @Test
    void validateCompletion_rejectsTruncatedResponse() throws Exception {
        JsonNode root = objectMapper.readTree("""
                {"choices":[{"finish_reason":"length"}]}
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateCompletion(root));

        assertEquals(ErrorCode.AI_RESPONSE_TRUNCATED, exception.getErrorCode());
    }

    @Test
    void validateExplanation_acceptsUnrelatedNoteWarning() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "detectedQuestion":"Solve 2 + 2",
                  "explanation":"Add the numbers.",
                  "finalAnswer":"4",
                  "inputConflict":false,
                  "inputWarning":"The note was unrelated, so the image was used."
                }
                """);

        AiResponseValidator.ExplanationPayload payload = validator.validateExplanation(parsed);

        assertEquals("4", payload.finalAnswer());
        assertEquals("The note was unrelated, so the image was used.", payload.inputWarning());
    }

    @Test
    void validateExplanation_rejectsNestedJsonInFinalAnswer() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "detectedQuestion":"Write an essay",
                  "explanation":"Use an outline.",
                  "finalAnswer":"{\\"detectedQuestion\\":\\"Write an essay\\",\\"explanation\\":\\"Outline\\",\\"finalAnswer\\":\\"Essay\\"}"
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateExplanation(parsed));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void validateExplanation_rejectsUnresolvableInputConflict() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "inputConflict":true,
                  "detectedQuestion":"",
                  "explanation":"",
                  "finalAnswer":""
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateExplanation(parsed));

        assertEquals(ErrorCode.AI_INPUT_CONFLICT, exception.getErrorCode());
    }

    @Test
    void validateGrading_rejectsScoreOutsideRange() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {"score":120,"feedback":"Good","mistakes":"","improvementSuggestions":""}
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateGrading(parsed, false));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }
}
