package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.QuestionSolution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QuestionSolutionRepository extends JpaRepository<QuestionSolution, Long> {
    List<QuestionSolution> findBySubmissionIdAndQuestionNumberInOrderByQuestionNumber(
            Long submissionId,
            Collection<Integer> questionNumbers
    );

    Optional<QuestionSolution> findByIdAndSubmissionId(Long id, Long submissionId);
}
