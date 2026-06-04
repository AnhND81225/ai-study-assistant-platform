package com.example.eduaiplatform.dto.response;

import java.time.Instant;

public record AiUsageQuotaResponse(
        long dailyLimit,
        long usedToday,
        long remainingToday,
        Instant resetAt
) {
}
