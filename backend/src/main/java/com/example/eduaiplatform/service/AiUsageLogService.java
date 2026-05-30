package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.response.AiUsageLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AiUsageLogService {
    Page<AiUsageLogResponse> getAll(Pageable pageable);
}
