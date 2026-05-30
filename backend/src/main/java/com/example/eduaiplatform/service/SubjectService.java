package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.request.SubjectRequest;
import com.example.eduaiplatform.dto.response.SubjectResponse;
import java.util.List;

public interface SubjectService {
    List<SubjectResponse> listSubjects();
    SubjectResponse createSubject(SubjectRequest request);
    SubjectResponse updateSubject(Long id, SubjectRequest request);
    void deleteSubject(Long id);
}
