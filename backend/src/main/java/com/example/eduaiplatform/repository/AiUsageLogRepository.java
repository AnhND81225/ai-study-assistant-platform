package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.AiUsageLog;
import com.example.eduaiplatform.entity.AiRequestType;
import com.example.eduaiplatform.entity.AiUsageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    Page<AiUsageLog> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndRequestTypeAndStatusAndCreatedAtGreaterThanEqual(
            Long userId,
            AiRequestType requestType,
            AiUsageStatus status,
            Instant createdAt
    );

    @Query("""
            select coalesce(sum(log.creditsUsed), 0)
            from AiUsageLog log
            where log.user.id = :userId
              and log.requestType = :requestType
              and log.status = :status
              and log.createdAt >= :createdAt
            """)
    long sumCreditsUsed(
            @Param("userId") Long userId,
            @Param("requestType") AiRequestType requestType,
            @Param("status") AiUsageStatus status,
            @Param("createdAt") Instant createdAt
    );

    @Modifying
    @Query("update AiUsageLog log set log.submission = null where log.submission.id = :submissionId")
    int clearSubmissionReference(@Param("submissionId") Long submissionId);
}
