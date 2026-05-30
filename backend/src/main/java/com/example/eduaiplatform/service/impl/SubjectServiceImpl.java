package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.dto.request.SubjectRequest;
import com.example.eduaiplatform.dto.response.SubjectResponse;
import com.example.eduaiplatform.entity.Subject;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.mapper.SubjectMapper;
import com.example.eduaiplatform.repository.SubjectRepository;
import com.example.eduaiplatform.service.SubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public List<SubjectResponse> listSubjects() {
        return subjectRepository.findAll().stream().map(SubjectMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        if (subjectRepository.existsByNameIgnoreCase(request.name())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "Subject already exists");
        }
        return SubjectMapper.toResponse(subjectRepository.save(new Subject(request.name().trim(), request.description())));
    }

    @Override
    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "Subject not found"));
        subject.update(request.name().trim(), request.description());
        return SubjectMapper.toResponse(subject);
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "Subject not found");
        }
        subjectRepository.deleteById(id);
    }
}
