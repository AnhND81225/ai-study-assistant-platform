package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.AiUsageLog;
import com.example.eduaiplatform.entity.AiRequestType;
import com.example.eduaiplatform.entity.AiUsageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    Page<AiUsageLog> findByUserId(Long userId, Pageable pageable);
    long countByUserIdAndRequestTypeAndStatusAndCreatedAtGreaterThanEqual(
            Long userId,
            AiRequestType requestType,
            AiUsageStatus status,
            Instant createdAt
    );
}
