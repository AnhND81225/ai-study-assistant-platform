package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.OpenAiProperties;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.AiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class OpenAiServiceImpl implements AiService {
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final OpenAiProperties properties;

    public OpenAiServiceImpl(
            WebClient.Builder builder,
            ObjectMapper objectMapper,
            OpenAiProperties properties
    ) {
        this.webClient = builder.baseUrl("https://api.openai.com/v1").build();
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    @Override
    public AiExplanationResult explain(String imageUrl, String subjectName, String note) {
        requireApiKey();
        String prompt = """
                You are a study tutor. Analyze the homework image for subject: %s.
                Optional student note: %s
                Return compact JSON only with keys: detectedQuestion, explanation, finalAnswer.
                Keep explanation step-by-step and concise.
                Use Markdown. Format mathematical expressions with LaTeX using $...$ for inline math and $$...$$ for display math.
                """.formatted(subjectName, note == null ? "" : note);

        JsonNode root = callChatCompletions(List.of(
                Map.of("role", "user", "content", List.of(
                        Map.of("type", "text", "text", prompt),
                        Map.of("type", "image_url", "image_url", Map.of("url", imageUrl))
                ))
        ));
        JsonNode parsed = parseContentJson(root);
        return new AiExplanationResult(
                parsed.path("detectedQuestion").asText("Question could not be detected clearly."),
                parsed.path("explanation").asText("No explanation was returned."),
                parsed.path("finalAnswer").asText(""),
                properties.getOpenaiModel(),
                root.path("usage").path("prompt_tokens").isNumber() ? root.path("usage").path("prompt_tokens").asInt() : null,
                root.path("usage").path("completion_tokens").isNumber() ? root.path("usage").path("completion_tokens").asInt() : null
        );
    }

    @Override
    public AiGradingResult grade(String detectedQuestion, String explanation, String finalAnswer, String userAnswer) {
        requireApiKey();
        String prompt = """
                Grade the student answer using the question and expected solution.
                Return compact JSON only with keys: score, feedback, mistakes, improvementSuggestions.
                Score must be an integer from 0 to 100.
                Use Markdown. Format mathematical expressions with LaTeX using $...$ for inline math and $$...$$ for display math.
                Question: %s
                Expected explanation: %s
                Expected final answer: %s
                Student answer: %s
                """.formatted(detectedQuestion, explanation, finalAnswer, userAnswer);

        JsonNode root = callChatCompletions(List.of(Map.of("role", "user", "content", prompt)));
        JsonNode parsed = parseContentJson(root);
        return new AiGradingResult(
                parsed.path("score").asInt(0),
                userAnswer,
                parsed.path("feedback").asText("No feedback was returned."),
                parsed.path("mistakes").asText(""),
                parsed.path("improvementSuggestions").asText(""),
                properties.getOpenaiModel(),
                root.path("usage").path("prompt_tokens").isNumber() ? root.path("usage").path("prompt_tokens").asInt() : null,
                root.path("usage").path("completion_tokens").isNumber() ? root.path("usage").path("completion_tokens").asInt() : null
        );
    }

    @Override
    public AiGradingResult gradeImage(String detectedQuestion, String explanation, String finalAnswer, String studentAnswerImageUrl) {
        requireApiKey();
        String prompt = """
                Grade the student's answer shown in the image using the question and expected solution.
                First read the student answer from the image. If handwriting is unclear, say so in feedback.
                Return compact JSON only with keys: score, detectedStudentAnswer, feedback, mistakes, improvementSuggestions.
                Score must be an integer from 0 to 100.
                Use Markdown. Format mathematical expressions with LaTeX using $...$ for inline math and $$...$$ for display math.
                Question: %s
                Expected explanation: %s
                Expected final answer: %s
                """.formatted(detectedQuestion, explanation, finalAnswer);

        JsonNode root = callChatCompletions(List.of(
                Map.of("role", "user", "content", List.of(
                        Map.of("type", "text", "text", prompt),
                        Map.of("type", "image_url", "image_url", Map.of("url", studentAnswerImageUrl))
                ))
        ));
        JsonNode parsed = parseContentJson(root);
        return new AiGradingResult(
                parsed.path("score").asInt(0),
                parsed.path("detectedStudentAnswer").asText("Student answer could not be detected clearly."),
                parsed.path("feedback").asText("No feedback was returned."),
                parsed.path("mistakes").asText(""),
                parsed.path("improvementSuggestions").asText(""),
                properties.getOpenaiModel(),
                root.path("usage").path("prompt_tokens").isNumber() ? root.path("usage").path("prompt_tokens").asInt() : null,
                root.path("usage").path("completion_tokens").isNumber() ? root.path("usage").path("completion_tokens").asInt() : null
        );
    }

    @Override
    public AiNewWorkGradingResult gradeNewWorkImage(String imageUrl, String subjectName, String note) {
        requireApiKey();
        String prompt = """
                You are grading a student's work from one image for subject: %s.
                The image may contain both the question and the student's written solution.
                Optional teacher/student note or rubric: %s
                Read the image, identify the question, identify the student's answer, solve the problem, then grade the work.
                Return compact JSON only with keys: detectedQuestion, expectedExplanation, finalAnswer, detectedStudentAnswer, score, feedback, mistakes, improvementSuggestions.
                Score must be an integer from 0 to 100.
                If handwriting or the question is unclear, lower confidence through feedback instead of inventing details.
                Use Markdown. Format mathematical expressions with LaTeX using $...$ for inline math and $$...$$ for display math.
                """.formatted(subjectName, note == null ? "" : note);

        JsonNode root = callChatCompletions(List.of(
                Map.of("role", "user", "content", List.of(
                        Map.of("type", "text", "text", prompt),
                        Map.of("type", "image_url", "image_url", Map.of("url", imageUrl))
                ))
        ));
        JsonNode parsed = parseContentJson(root);
        return new AiNewWorkGradingResult(
                parsed.path("detectedQuestion").asText("Question could not be detected clearly."),
                parsed.path("expectedExplanation").asText("No expected explanation was returned."),
                parsed.path("finalAnswer").asText(""),
                parsed.path("detectedStudentAnswer").asText("Student answer could not be detected clearly."),
                parsed.path("score").asInt(0),
                parsed.path("feedback").asText("No feedback was returned."),
                parsed.path("mistakes").asText(""),
                parsed.path("improvementSuggestions").asText(""),
                properties.getOpenaiModel(),
                root.path("usage").path("prompt_tokens").isNumber() ? root.path("usage").path("prompt_tokens").asInt() : null,
                root.path("usage").path("completion_tokens").isNumber() ? root.path("usage").path("completion_tokens").asInt() : null
        );
    }

    private JsonNode callChatCompletions(List<Map<String, Object>> messages) {
        try {
            Map<String, Object> body = Map.of(
                    "model", properties.getOpenaiModel(),
                    "messages", messages,
                    "temperature", 0.2,
                    "response_format", Map.of("type", "json_object"),
                    "max_completion_tokens", properties.getMaxOutputTokens()
            );
            String response = webClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getOpenaiApiKey())
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .block();
            return objectMapper.readTree(response);
        } catch (WebClientResponseException e) {
            throw mapOpenAiResponseError(e);
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.AI_RESPONSE_PARSE_ERROR, "AI provider returned an unexpected response");
        } catch (Exception e) {
            if (hasCause(e, TimeoutException.class)) {
                throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, ErrorCode.AI_TIMEOUT, "AI provider request timed out. Please try again later.");
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.AI_PROVIDER_ERROR, "AI provider request failed. Please try again later.");
        }
    }

    private JsonNode parseContentJson(JsonNode root) {
        try {
            String content = root.path("choices").path(0).path("message").path("content").asText("{}");
            return objectMapper.readTree(content);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.AI_RESPONSE_PARSE_ERROR, "AI provider returned an unexpected response");
        }
    }

    private void requireApiKey() {
        String apiKey = properties.getOpenaiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.AI_PROVIDER_UNAVAILABLE, "AI provider is not configured");
        }
    }

    private ApiException mapOpenAiResponseError(WebClientResponseException e) {
        String errorCode = extractOpenAiErrorCode(e.getResponseBodyAsString());
        String message = extractOpenAiErrorMessage(e.getResponseBodyAsString()).toLowerCase();
        HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
        HttpStatus responseStatus = status == null ? HttpStatus.BAD_GATEWAY : status;

        if (e.getStatusCode().value() == 401) {
            return new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.AI_INVALID_API_KEY, "AI provider credentials are invalid");
        }
        if (e.getStatusCode().value() == 429 && "insufficient_quota".equals(errorCode)) {
            return new ApiException(HttpStatus.TOO_MANY_REQUESTS, ErrorCode.AI_QUOTA_EXCEEDED, "AI provider quota has been exceeded");
        }
        if (e.getStatusCode().value() == 429) {
            return new ApiException(HttpStatus.TOO_MANY_REQUESTS, ErrorCode.AI_RATE_LIMITED, "AI provider is rate limited. Please try again later.");
        }
        if (e.getStatusCode().value() == 400 && (message.contains("image") || message.contains("unsupported"))) {
            return new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.AI_UNSUPPORTED_IMAGE, "AI provider could not process this image");
        }
        if (e.getStatusCode().value() == 400) {
            return new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.AI_BAD_REQUEST, "AI provider rejected the request");
        }
        if (e.getStatusCode().is5xxServerError()) {
            return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.AI_PROVIDER_UNAVAILABLE, "AI provider is temporarily unavailable");
        }
        return new ApiException(responseStatus, ErrorCode.AI_PROVIDER_ERROR, "AI provider request failed. Please try again later.");
    }

    private String extractOpenAiErrorCode(String responseBody) {
        try {
            JsonNode error = objectMapper.readTree(responseBody).path("error");
            return error.path("code").asText("");
        } catch (Exception ignored) {
            return "";
        }
    }

    private String extractOpenAiErrorMessage(String responseBody) {
        try {
            JsonNode error = objectMapper.readTree(responseBody).path("error");
            return error.path("message").asText("");
        } catch (Exception ignored) {
            return "";
        }
    }

    private boolean hasCause(Throwable throwable, Class<? extends Throwable> causeType) {
        Throwable current = throwable;
        while (current != null) {
            if (causeType.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
