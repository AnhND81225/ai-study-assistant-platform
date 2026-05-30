package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.dto.response.AiUsageLogResponse;
import com.example.eduaiplatform.mapper.AiUsageLogMapper;
import com.example.eduaiplatform.repository.AiUsageLogRepository;
import com.example.eduaiplatform.service.AiUsageLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AiUsageLogServiceImpl implements AiUsageLogService {
    private final AiUsageLogRepository aiUsageLogRepository;

    public AiUsageLogServiceImpl(AiUsageLogRepository aiUsageLogRepository) {
        this.aiUsageLogRepository = aiUsageLogRepository;
    }

    @Override
    public Page<AiUsageLogResponse> getAll(Pageable pageable) {
        return aiUsageLogRepository.findAll(pageable).map(AiUsageLogMapper::toResponse);
    }
}
