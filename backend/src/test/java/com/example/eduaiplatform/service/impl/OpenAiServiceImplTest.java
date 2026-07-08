package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.OpenAiProperties;
import com.example.eduaiplatform.entity.AiQuestionType;
import com.example.eduaiplatform.entity.AiResultStatus;
import com.example.eduaiplatform.entity.AiSolveMode;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.AiService;
import com.example.eduaiplatform.validation.AiResponseValidator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OpenAiServiceImplTest {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OpenAiProperties properties = properties();
    private final AiResponseValidator validator = new AiResponseValidator(objectMapper);

    @Test
    void explain_sendsRequestToChatCompletionsAndParsesStructuredOutput() {
        List<ClientRequest> requests = new ArrayList<>();
        OpenAiServiceImpl service = serviceWithResponse(requests, okChatResponse("""
                {
                  "questionType":"SINGLE_QUESTION",
                  "resultStatus":"SOLUTION_READY",
                  "availableQuestions":[],
                  "selectedQuestionNumber":null,
                  "detectedQuestion":"Solve $2 + 2$",
                  "explanation":"Add both numbers.",
                  "finalAnswer":"$4$",
                  "inputConflict":false,
                  "inputWarning":""
                }
                """));

        AiService.AiExplanationResult result = service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "please solve",
                null,
                AiSolveMode.AUTO
        );

        assertEquals("Solve $2 + 2$", result.detectedQuestion());
        assertEquals("$4$", result.finalAnswer());
        assertEquals(AiQuestionType.SINGLE_QUESTION, result.questionType());
        assertEquals(AiResultStatus.SOLUTION_READY, result.resultStatus());
        assertEquals("test-model", result.modelName());
        assertEquals(123, result.inputTokens());
        assertEquals(45, result.outputTokens());
        assertEquals(1, requests.size());
        assertEquals(HttpMethod.POST, requests.getFirst().method());
        assertEquals("/chat/completions", requests.getFirst().url().getPath());
        assertEquals("Bearer test-api-key", requests.getFirst().headers().getFirst(HttpHeaders.AUTHORIZATION));
    }

    @Test
    void gradeImage_parsesDetectedStudentAnswerFromMockOpenAiResponse() {
        OpenAiServiceImpl service = serviceWithResponse(new ArrayList<>(), okChatResponse("""
                {
                  "score":85,
                  "detectedStudentAnswer":"The student wrote $x = 4$.",
                  "feedback":"Mostly correct.",
                  "mistakes":"Minor notation issue.",
                  "improvementSuggestions":"Show one more algebra step."
                }
                """));

        AiService.AiGradingResult result = service.gradeImage(
                "Solve for x",
                "Move constants to the right side.",
                "$x = 4$",
                "https://res.cloudinary.com/demo/image/upload/answer.png"
        );

        assertEquals(85, result.score());
        assertEquals("The student wrote $x = 4$.", result.detectedStudentAnswer());
        assertEquals("Mostly correct.", result.feedback());
        assertEquals("test-model", result.modelName());
    }

    @Test
    void gradeNewWorkImage_rejectsMalformedJsonContent() {
        OpenAiServiceImpl service = serviceWithResponse(new ArrayList<>(), """
                {
                  "choices":[{"finish_reason":"stop","message":{"content":"{not-json"}}],
                  "usage":{"prompt_tokens":1,"completion_tokens":1}
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> service.gradeNewWorkImage(
                "https://res.cloudinary.com/demo/image/upload/work.png",
                "Math",
                ""
        ));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void grade_rejectsStructuredOutputWithMissingRequiredFields() {
        OpenAiServiceImpl service = serviceWithResponse(new ArrayList<>(), okChatResponse("""
                {"score":90}
                """));

        ApiException exception = assertThrows(ApiException.class, () -> service.grade(
                "Question",
                "Expected steps",
                "Expected answer",
                "Student answer"
        ));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void explain_rejectsRefusalLikeResponseWithoutContentContract() {
        OpenAiServiceImpl service = serviceWithResponse(new ArrayList<>(), """
                {
                  "choices":[{"finish_reason":"stop","message":{"refusal":"I cannot help with that."}}],
                  "usage":{"prompt_tokens":1,"completion_tokens":1}
                }
                """);

        ApiException exception = assertThrows(ApiException.class, () -> service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "",
                null,
                AiSolveMode.AUTO
        ));

        assertEquals(ErrorCode.AI_RESPONSE_PARSE_ERROR, exception.getErrorCode());
    }

    @Test
    void explain_mapsRateLimitResponse() {
        OpenAiServiceImpl service = serviceWithExchange(request -> Mono.just(errorResponse(
                HttpStatus.TOO_MANY_REQUESTS,
                """
                        {"error":{"code":"rate_limit_exceeded","message":"Too many requests"}}
                        """
        )));

        ApiException exception = assertThrows(ApiException.class, () -> service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "",
                null,
                AiSolveMode.AUTO
        ));

        assertEquals(ErrorCode.AI_RATE_LIMITED, exception.getErrorCode());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exception.getStatus());
    }

    @Test
    void explain_mapsQuotaExceededResponse() {
        OpenAiServiceImpl service = serviceWithExchange(request -> Mono.just(errorResponse(
                HttpStatus.TOO_MANY_REQUESTS,
                """
                        {"error":{"code":"insufficient_quota","message":"Quota exceeded"}}
                        """
        )));

        ApiException exception = assertThrows(ApiException.class, () -> service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "",
                null,
                AiSolveMode.AUTO
        ));

        assertEquals(ErrorCode.AI_QUOTA_EXCEEDED, exception.getErrorCode());
    }

    @Test
    void explain_mapsTimeoutCause() {
        OpenAiServiceImpl service = serviceWithExchange(request ->
                Mono.error(new RuntimeException(new TimeoutException("mock timeout")))
        );

        ApiException exception = assertThrows(ApiException.class, () -> service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "",
                null,
                AiSolveMode.AUTO
        ));

        assertEquals(ErrorCode.AI_TIMEOUT, exception.getErrorCode());
        assertEquals(HttpStatus.GATEWAY_TIMEOUT, exception.getStatus());
    }

    @Test
    void explain_doesNotCallOpenAiWhenApiKeyIsMissing() {
        OpenAiProperties missingKeyProperties = properties();
        missingKeyProperties.setOpenaiApiKey("");
        OpenAiServiceImpl service = new OpenAiServiceImpl(
                WebClient.builder().exchangeFunction(request -> {
                    throw new AssertionError("OpenAI should not be called without an API key");
                }).build(),
                objectMapper,
                missingKeyProperties,
                validator
        );

        ApiException exception = assertThrows(ApiException.class, () -> service.explain(
                "https://res.cloudinary.com/demo/image/upload/question.png",
                "Math",
                "",
                null,
                AiSolveMode.AUTO
        ));

        assertEquals(ErrorCode.AI_PROVIDER_UNAVAILABLE, exception.getErrorCode());
    }

    private OpenAiServiceImpl serviceWithResponse(List<ClientRequest> requests, String responseBody) {
        return serviceWithExchange(request -> {
            requests.add(request);
            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(responseBody)
                    .build());
        });
    }

    private OpenAiServiceImpl serviceWithExchange(ExchangeFunction exchangeFunction) {
        return new OpenAiServiceImpl(
                WebClient.builder().exchangeFunction(exchangeFunction).build(),
                objectMapper,
                properties,
                validator
        );
    }

    private ClientResponse errorResponse(HttpStatus status, String body) {
        return ClientResponse.create(status)
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .body(body)
                .build();
    }

    private String okChatResponse(String contentJson) {
        try {
            String encodedContent = objectMapper.writeValueAsString(contentJson.strip());
            return """
                    {
                      "choices":[{"finish_reason":"stop","message":{"content":%s}}],
                      "usage":{"prompt_tokens":123,"completion_tokens":45}
                    }
                    """.formatted(encodedContent);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(e);
        }
    }

    private OpenAiProperties properties() {
        OpenAiProperties props = new OpenAiProperties();
        props.setOpenaiApiKey("test-api-key");
        props.setOpenaiModel("test-model");
        props.setTimeoutSeconds(2);
        props.setMaxOutputTokens(700);
        return props;
    }
}
