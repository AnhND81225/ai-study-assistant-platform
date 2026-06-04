package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/")
    public ApiResponse<Map<String, String>> root() {
        return ApiResponse.success("AI Study Assistant API is running", Map.of(
                "service", "edu-ai-platform",
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/healthz")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success("Service is healthy", Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }
}
