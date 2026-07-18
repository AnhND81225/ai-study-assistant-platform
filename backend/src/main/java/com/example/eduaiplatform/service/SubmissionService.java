package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.request.GradeRequest;
import com.example.eduaiplatform.dto.request.SolveQuestionsRequest;
import com.example.eduaiplatform.dto.request.SubmissionUpdateRequest;
import com.example.eduaiplatform.dto.response.GradingResultResponse;
import com.example.eduaiplatform.dto.response.SubmissionResponse;
import com.example.eduaiplatform.entity.AiSolveMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface SubmissionService {
    SubmissionResponse createSubmission(Long subjectId, String note, MultipartFile image);
    Page<SubmissionResponse> getMySubmissions(Pageable pageable, Long subjectId, String status, Boolean favorite, String search);
    SubmissionResponse getSubmission(Long id);
    SubmissionResponse updateSubmission(Long id, SubmissionUpdateRequest request);
    void deleteOwnSubmission(Long id);
    SubmissionResponse explainSubmission(Long id, Integer questionNumber, AiSolveMode solveMode);
    SubmissionResponse solveQuestions(Long id, SolveQuestionsRequest request);
    GradingResultResponse gradeSubmission(Long id, GradeRequest request);
    GradingResultResponse gradeSubmissionImage(Long id, Long questionSolutionId, MultipartFile image);
    SubmissionResponse gradeNewWorkImage(Long subjectId, String note, MultipartFile image);
    Page<SubmissionResponse> getAllSubmissions(Pageable pageable);
    SubmissionResponse getAdminSubmission(Long id);
}
