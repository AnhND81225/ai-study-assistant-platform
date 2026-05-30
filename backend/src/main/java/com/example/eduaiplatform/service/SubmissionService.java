package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.request.GradeRequest;
import com.example.eduaiplatform.dto.response.GradingResultResponse;
import com.example.eduaiplatform.dto.response.SubmissionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface SubmissionService {
    SubmissionResponse createSubmission(Long subjectId, String note, MultipartFile image);
    Page<SubmissionResponse> getMySubmissions(Pageable pageable);
    SubmissionResponse getSubmission(Long id);
    void deleteOwnSubmission(Long id);
    SubmissionResponse explainSubmission(Long id);
    GradingResultResponse gradeSubmission(Long id, GradeRequest request);
    Page<SubmissionResponse> getAllSubmissions(Pageable pageable);
    SubmissionResponse getAdminSubmission(Long id);
}
