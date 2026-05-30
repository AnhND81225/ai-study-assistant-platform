package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.AiUsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    Page<AiUsageLog> findByUserId(Long userId, Pageable pageable);
}
