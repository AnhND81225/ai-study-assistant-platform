package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.dto.response.AiUsageLogResponse;
import com.example.eduaiplatform.dto.response.AiUsageQuotaResponse;
import com.example.eduaiplatform.entity.AiRequestType;
import com.example.eduaiplatform.entity.AiUsageStatus;
import com.example.eduaiplatform.mapper.AiUsageLogMapper;
import com.example.eduaiplatform.repository.AiUsageLogRepository;
import com.example.eduaiplatform.security.SecurityUtils;
import com.example.eduaiplatform.service.AiUsageLogService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@Service
public class AiUsageLogServiceImpl implements AiUsageLogService {
    private final AiUsageLogRepository aiUsageLogRepository;
    private final long explainLimitPerUser;

    public AiUsageLogServiceImpl(
            AiUsageLogRepository aiUsageLogRepository,
            @Value("${app.ai.explain-limit-per-user}") long explainLimitPerUser
    ) {
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.explainLimitPerUser = explainLimitPerUser;
    }

    @Override
    public Page<AiUsageLogResponse> getAll(Pageable pageable) {
        return aiUsageLogRepository.findAll(pageable).map(AiUsageLogMapper::toResponse);
    }

    @Override
    public AiUsageQuotaResponse getCurrentUserQuota() {
        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant tomorrowStart = LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        long used = aiUsageLogRepository.sumCreditsUsed(
                SecurityUtils.currentUserId(),
                AiRequestType.EXPLAIN,
                AiUsageStatus.SUCCESS,
                todayStart
        );
        long remaining = Math.max(0, explainLimitPerUser - used);
        return new AiUsageQuotaResponse(explainLimitPerUser, used, remaining, tomorrowStart);
    }
}
