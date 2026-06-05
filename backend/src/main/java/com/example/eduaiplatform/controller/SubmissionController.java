package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.request.GradeRequest;
import com.example.eduaiplatform.dto.request.SubmissionUpdateRequest;
import com.example.eduaiplatform.dto.response.ApiResponse;
import com.example.eduaiplatform.dto.response.GradingResultResponse;
import com.example.eduaiplatform.dto.response.SubmissionResponse;
import com.example.eduaiplatform.service.SubmissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
public class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/api/submissions")
    public ApiResponse<SubmissionResponse> create(
            @RequestParam @NotNull Long subjectId,
            @RequestParam(required = false) String note,
            @RequestPart("image") MultipartFile image
    ) {
        return ApiResponse.success("Submission created", submissionService.createSubmission(subjectId, note, image));
    }

    @GetMapping("/api/submissions/me")
    public ApiResponse<Page<SubmissionResponse>> mine(
            Pageable pageable,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success("My submissions", submissionService.getMySubmissions(pageable, subjectId, status, favorite, search));
    }

    @GetMapping("/api/submissions/{id}")
    public ApiResponse<SubmissionResponse> detail(@PathVariable Long id) {
        return ApiResponse.success("Submission detail", submissionService.getSubmission(id));
    }

    @PatchMapping("/api/submissions/{id}")
    public ApiResponse<SubmissionResponse> update(@PathVariable Long id, @Valid @RequestBody SubmissionUpdateRequest request) {
        return ApiResponse.success("Submission updated", submissionService.updateSubmission(id, request));
    }

    @DeleteMapping("/api/submissions/{id}")
    public ApiResponse<Void> deleteOwn(@PathVariable Long id) {
        submissionService.deleteOwnSubmission(id);
        return ApiResponse.success("Submission deleted", null);
    }

    @PostMapping("/api/submissions/{id}/explain")
    public ApiResponse<SubmissionResponse> explain(@PathVariable Long id) {
        return ApiResponse.success("Explanation generated", submissionService.explainSubmission(id));
    }

    @PostMapping("/api/submissions/{id}/grade")
    public ApiResponse<GradingResultResponse> grade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return ApiResponse.success("Answer graded", submissionService.gradeSubmission(id, request));
    }

    @PostMapping("/api/submissions/{id}/grade-image")
    public ApiResponse<GradingResultResponse> gradeImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return ApiResponse.success("Answer image graded", submissionService.gradeSubmissionImage(id, image));
    }

    @PostMapping("/api/gradings/image")
    public ApiResponse<SubmissionResponse> gradeNewWorkImage(
            @RequestParam @NotNull Long subjectId,
            @RequestParam(required = false) String note,
            @RequestPart("image") MultipartFile image
    ) {
        return ApiResponse.success("Student work graded", submissionService.gradeNewWorkImage(subjectId, note, image));
    }

    @GetMapping("/api/admin/submissions")
    public ApiResponse<Page<SubmissionResponse>> all(Pageable pageable) {
        return ApiResponse.success("Submissions", submissionService.getAllSubmissions(pageable));
    }

    @GetMapping("/api/admin/submissions/{id}")
    public ApiResponse<SubmissionResponse> adminDetail(@PathVariable Long id) {
        return ApiResponse.success("Submission detail", submissionService.getAdminSubmission(id));
    }
}
