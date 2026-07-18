package com.example.eduaiplatform.mapper;

import com.example.eduaiplatform.dto.response.AiUsageLogResponse;
import com.example.eduaiplatform.entity.AiUsageLog;

public final class AiUsageLogMapper {
    private AiUsageLogMapper() {
    }

    public static AiUsageLogResponse toResponse(AiUsageLog log) {
        return new AiUsageLogResponse(
                log.getId(),
                log.getRequestType().name(),
                log.getModelName(),
                log.getInputTokens(),
                log.getOutputTokens(),
                log.getCreditsUsed(),
                log.getStatus().name(),
                log.getErrorMessage(),
                log.getCreatedAt()
        );
    }
}
