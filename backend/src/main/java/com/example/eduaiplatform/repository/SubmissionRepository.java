package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Page<Submission> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Page<Submission> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Optional<Submission> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Optional<Submission> findByIdAndUserId(Long id, Long userId);
}
