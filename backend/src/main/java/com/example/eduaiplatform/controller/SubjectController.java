package com.example.eduaiplatform.controller;

import com.example.eduaiplatform.dto.request.SubjectRequest;
import com.example.eduaiplatform.dto.response.ApiResponse;
import com.example.eduaiplatform.dto.response.SubjectResponse;
import com.example.eduaiplatform.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubjectController {
    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("/api/subjects")
    public ApiResponse<List<SubjectResponse>> list() {
        return ApiResponse.success("Subjects", subjectService.listSubjects());
    }

    @PostMapping("/api/admin/subjects")
    public ApiResponse<SubjectResponse> create(@Valid @RequestBody SubjectRequest request) {
        return ApiResponse.success("Subject created", subjectService.createSubject(request));
    }

    @PutMapping("/api/admin/subjects/{id}")
    public ApiResponse<SubjectResponse> update(@PathVariable Long id, @Valid @RequestBody SubjectRequest request) {
        return ApiResponse.success("Subject updated", subjectService.updateSubject(id, request));
    }

    @DeleteMapping("/api/admin/subjects/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ApiResponse.success("Subject deleted", null);
    }
}
