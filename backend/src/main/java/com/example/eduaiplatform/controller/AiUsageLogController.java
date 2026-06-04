package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.response.AiUsageLogResponse;
import com.example.eduaiplatform.dto.response.AiUsageQuotaResponse;
import com.example.eduaiplatform.dto.response.ApiResponse;
import com.example.eduaiplatform.service.AiUsageLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiUsageLogController {
    private final AiUsageLogService aiUsageLogService;

    public AiUsageLogController(AiUsageLogService aiUsageLogService) {
        this.aiUsageLogService = aiUsageLogService;
    }

    @GetMapping("/api/admin/ai-usage-logs")
    public ApiResponse<Page<AiUsageLogResponse>> list(Pageable pageable) {
        return ApiResponse.success("AI usage logs", aiUsageLogService.getAll(pageable));
    }

    @GetMapping("/api/ai-usage/me")
    public ApiResponse<AiUsageQuotaResponse> myQuota() {
        return ApiResponse.success("My AI usage quota", aiUsageLogService.getCurrentUserQuota());
    }
}
