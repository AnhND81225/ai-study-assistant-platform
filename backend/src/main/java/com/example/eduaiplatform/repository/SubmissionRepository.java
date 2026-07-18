package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.Submission;
import com.example.eduaiplatform.entity.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    @EntityGraph(attributePaths = {"user", "subject", "aiResponse"})
    Page<Submission> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse"})
    @Query("""
            select distinct s
            from Submission s
            left join s.aiResponse ar
            where s.user.id = :userId
              and (:subjectId is null or s.subject.id = :subjectId)
              and (:status is null or s.status = :status)
              and (:favorite is null or s.favorite = :favorite)
              and (
                :search is null
                or lower(coalesce(s.title, '')) like concat('%', lower(cast(:search as string)), '%')
                or lower(coalesce(s.note, '')) like concat('%', lower(cast(:search as string)), '%')
                or lower(coalesce(ar.detectedQuestion, '')) like concat('%', lower(cast(:search as string)), '%')
                or lower(coalesce(s.originalFileName, '')) like concat('%', lower(cast(:search as string)), '%')
              )
            """)
    Page<Submission> searchByUser(
            @Param("userId") Long userId,
            @Param("subjectId") Long subjectId,
            @Param("status") SubmissionStatus status,
            @Param("favorite") Boolean favorite,
            @Param("search") String search,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse"})
    Page<Submission> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Optional<Submission> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"user", "subject", "aiResponse", "gradingResults"})
    Optional<Submission> findByIdAndUserId(Long id, Long userId);
}
