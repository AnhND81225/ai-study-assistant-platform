package com.example.eduaiplatform.dto.response;

import java.time.Instant;

public record AiUsageLogResponse(
        Long id,
        String requestType,
        String modelName,
        Integer inputTokens,
        Integer outputTokens,
        Integer creditsUsed,
        String status,
        String errorMessage,
        Instant createdAt
) {
}
