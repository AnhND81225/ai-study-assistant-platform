package com.example.eduaiplatform.mapper;

import com.example.eduaiplatform.dto.response.SubjectResponse;
import com.example.eduaiplatform.entity.Subject;

public final class SubjectMapper {
    private SubjectMapper() {
    }

    public static SubjectResponse toResponse(Subject subject) {
        return new SubjectResponse(subject.getId(), subject.getName(), subject.getDescription());
    }
}
