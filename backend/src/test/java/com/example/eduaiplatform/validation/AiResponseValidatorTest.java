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
                  "questionType":"SINGLE_QUESTION",
                  "resultStatus":"SOLUTION_READY",
                  "availableQuestions":[],
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
        assertEquals("SOLUTION_READY", payload.resultStatus().name());
    }

    @Test
    void validateExplanation_acceptsQuestionSelectionRequired() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "questionType":"MULTIPLE_CHOICE",
                  "resultStatus":"QUESTION_SELECTION_REQUIRED",
                  "availableQuestions":[3,1,2,2],
                  "detectedQuestion":"Questions 1 to 3",
                  "explanation":"",
                  "finalAnswer":"",
                  "inputConflict":false,
                  "inputWarning":""
                }
                """);

        AiResponseValidator.ExplanationPayload payload = validator.validateExplanation(parsed);

        assertEquals("QUESTION_SELECTION_REQUIRED", payload.resultStatus().name());
        assertEquals(java.util.List.of(1, 2, 3), payload.availableQuestions());
        assertEquals("Choose one of the detected question numbers to continue.", payload.explanation());
    }

    @Test
    void validateExplanation_rejectsSelectionWithoutQuestionNumbers() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "questionType":"MULTI_QUESTION",
                  "resultStatus":"QUESTION_SELECTION_REQUIRED",
                  "availableQuestions":[],
                  "detectedQuestion":"Several questions",
                  "explanation":"",
                  "finalAnswer":""
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateExplanation(parsed));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void validateExplanation_rejectsInvalidEnumValue() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "questionType":"ESSAY",
                  "resultStatus":"SOLUTION_READY",
                  "availableQuestions":[],
                  "detectedQuestion":"Solve 2 + 2",
                  "explanation":"Add the numbers.",
                  "finalAnswer":"4"
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateExplanation(parsed));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void validateExplanation_rejectsSolutionReadyWithoutFinalAnswer() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "questionType":"SINGLE_QUESTION",
                  "resultStatus":"SOLUTION_READY",
                  "availableQuestions":[],
                  "detectedQuestion":"Solve 2 + 2",
                  "explanation":"Add the numbers.",
                  "finalAnswer":""
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateExplanation(parsed));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void validateExplanation_rejectsNestedJsonInFinalAnswer() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "questionType":"SINGLE_QUESTION",
                  "resultStatus":"SOLUTION_READY",
                  "availableQuestions":[],
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

    @Test
    void validateQuestionSolutions_rejectsMissingRequestedQuestion() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "solutions":[
                    {"questionNumber":1,"detectedQuestion":"Question 1","explanation":"Steps","finalAnswer":"Answer"}
                  ]
                }
                """);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> validator.validateQuestionSolutions(parsed, java.util.List.of(1, 2))
        );

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void validateNewWork_acceptsCompleteWorksheetGradingContract() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "detectedQuestion":"Solve 2 + 2",
                  "expectedExplanation":"Add both numbers.",
                  "finalAnswer":"4",
                  "detectedStudentAnswer":"The student wrote 4.",
                  "score":100,
                  "feedback":"Correct.",
                  "mistakes":"",
                  "improvementSuggestions":"Keep showing the final step.",
                  "inputConflict":false,
                  "inputWarning":""
                }
                """);

        AiResponseValidator.NewWorkPayload payload = validator.validateNewWork(parsed);

        assertEquals(100, payload.score());
        assertEquals("The student wrote 4.", payload.detectedStudentAnswer());
        assertEquals("Correct.", payload.feedback());
    }

    @Test
    void validateNewWork_rejectsMissingDetectedStudentAnswer() throws Exception {
        JsonNode parsed = objectMapper.readTree("""
                {
                  "detectedQuestion":"Solve 2 + 2",
                  "expectedExplanation":"Add both numbers.",
                  "finalAnswer":"4",
                  "score":100,
                  "feedback":"Correct.",
                  "mistakes":"",
                  "improvementSuggestions":""
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> validator.validateNewWork(parsed));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }
}
