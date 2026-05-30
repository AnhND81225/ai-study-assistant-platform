package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiServiceImpl implements AiService {
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final Duration timeout;

    public OpenAiServiceImpl(
            WebClient.Builder builder,
            ObjectMapper objectMapper,
            @Value("${app.ai.openai-api-key}") String apiKey,
            @Value("${app.ai.openai-model}") String model,
            @Value("${app.ai.timeout-seconds}") long timeoutSeconds
    ) {
        this.webClient = builder.baseUrl("https://api.openai.com/v1").build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
    }

    @Override
    public AiExplanationResult explain(String imageUrl, String subjectName, String note) {
        requireApiKey();
        String prompt = """
                You are a study tutor. Analyze the homework image for subject: %s.
                Optional student note: %s
                Return compact JSON only with keys: detectedQuestion, explanation, finalAnswer.
                Keep explanation step-by-step and concise.
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
                model,
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
                Question: %s
                Expected explanation: %s
                Expected final answer: %s
                Student answer: %s
                """.formatted(detectedQuestion, explanation, finalAnswer, userAnswer);

        JsonNode root = callChatCompletions(List.of(Map.of("role", "user", "content", prompt)));
        JsonNode parsed = parseContentJson(root);
        return new AiGradingResult(
                parsed.path("score").asInt(0),
                parsed.path("feedback").asText("No feedback was returned."),
                parsed.path("mistakes").asText(""),
                parsed.path("improvementSuggestions").asText(""),
                model,
                root.path("usage").path("prompt_tokens").isNumber() ? root.path("usage").path("prompt_tokens").asInt() : null,
                root.path("usage").path("completion_tokens").isNumber() ? root.path("usage").path("completion_tokens").asInt() : null
        );
    }

    private JsonNode callChatCompletions(List<Map<String, Object>> messages) {
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", messages,
                    "temperature", 0.2,
                    "response_format", Map.of("type", "json_object")
            );
            String response = webClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(timeout)
                    .block();
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.EXTERNAL_SERVICE_ERROR, "AI provider request failed");
        }
    }

    private JsonNode parseContentJson(JsonNode root) {
        try {
            String content = root.path("choices").path(0).path("message").path("content").asText("{}");
            return objectMapper.readTree(content);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.EXTERNAL_SERVICE_ERROR, "AI provider returned an unexpected response");
        }
    }

    private void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.EXTERNAL_SERVICE_ERROR, "AI provider is not configured");
        }
    }
}
