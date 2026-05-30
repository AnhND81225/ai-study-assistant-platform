package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.dto.request.GradeRequest;
import com.example.eduaiplatform.dto.response.GradingResultResponse;
import com.example.eduaiplatform.dto.response.SubmissionResponse;
import com.example.eduaiplatform.entity.*;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.mapper.SubmissionMapper;
import com.example.eduaiplatform.repository.*;
import com.example.eduaiplatform.security.SecurityUtils;
import com.example.eduaiplatform.service.AiService;
import com.example.eduaiplatform.service.CloudinaryService;
import com.example.eduaiplatform.service.SubmissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final AiResponseRepository aiResponseRepository;
    private final GradingResultRepository gradingResultRepository;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final CloudinaryService cloudinaryService;
    private final AiService aiService;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            AiResponseRepository aiResponseRepository,
            GradingResultRepository gradingResultRepository,
            AiUsageLogRepository aiUsageLogRepository,
            CloudinaryService cloudinaryService,
            AiService aiService
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.aiResponseRepository = aiResponseRepository;
        this.gradingResultRepository = gradingResultRepository;
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.cloudinaryService = cloudinaryService;
        this.aiService = aiService;
    }

    @Override
    @Transactional
    public SubmissionResponse createSubmission(Long subjectId, String note, MultipartFile image) {
        User user = currentUserEntity();
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "Subject not found"));
        CloudinaryService.UploadResult upload = cloudinaryService.uploadHomeworkImage(image);
        Submission submission = submissionRepository.save(new Submission(
                user,
                subject,
                upload.imageUrl(),
                upload.publicId(),
                image.getOriginalFilename(),
                note
        ));
        return SubmissionMapper.toResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubmissionResponse> getMySubmissions(Pageable pageable) {
        return submissionRepository.findByUserId(SecurityUtils.currentUserId(), pageable)
                .map(SubmissionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmission(Long id) {
        Submission submission = SecurityUtils.isAdmin()
                ? findSubmission(id)
                : submissionRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, "You cannot access this submission"));
        return SubmissionMapper.toResponse(submission);
    }

    @Override
    @Transactional
    public void deleteOwnSubmission(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "Submission not found"));
        if (!submission.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, "You can delete only your own submissions");
        }
        String publicId = submission.getCloudinaryPublicId();
        submissionRepository.delete(submission);
        cloudinaryService.deleteAsset(publicId);
    }

    @Override
    @Transactional
    public SubmissionResponse explainSubmission(Long id) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        if (submission.getAiResponse() != null) {
            return SubmissionMapper.toResponse(submission);
        }
        try {
            AiService.AiExplanationResult result = aiService.explain(
                    submission.getImageUrl(),
                    submission.getSubject().getName(),
                    submission.getNote()
            );
            AiResponse response = new AiResponse(
                    submission,
                    result.detectedQuestion(),
                    result.explanation(),
                    result.finalAnswer(),
                    result.modelName()
            );
            aiResponseRepository.save(response);
            submission.markExplained(response);
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.EXPLAIN,
                    result.modelName(),
                    result.inputTokens(),
                    result.outputTokens(),
                    AiUsageStatus.SUCCESS,
                    null
            ));
            return SubmissionMapper.toResponse(submission);
        } catch (ApiException ex) {
            submission.markAiFailed();
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.EXPLAIN,
                    null,
                    null,
                    null,
                    AiUsageStatus.FAILED,
                    ex.getMessage()
            ));
            throw ex;
        }
    }

    @Override
    @Transactional
    public GradingResultResponse gradeSubmission(Long id, GradeRequest request) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        AiResponse aiResponse = submission.getAiResponse();
        if (aiResponse == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Generate an explanation before grading");
        }
        try {
            AiService.AiGradingResult result = aiService.grade(
                    aiResponse.getDetectedQuestion(),
                    aiResponse.getExplanation(),
                    aiResponse.getFinalAnswer(),
                    request.userAnswer()
            );
            GradingResult gradingResult = gradingResultRepository.save(new GradingResult(
                    submission,
                    request.userAnswer(),
                    result.score(),
                    result.feedback(),
                    result.mistakes(),
                    result.improvementSuggestions()
            ));
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.GRADE,
                    result.modelName(),
                    result.inputTokens(),
                    result.outputTokens(),
                    AiUsageStatus.SUCCESS,
                    null
            ));
            return SubmissionMapper.toGradingResponse(gradingResult);
        } catch (ApiException ex) {
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.GRADE,
                    null,
                    null,
                    null,
                    AiUsageStatus.FAILED,
                    ex.getMessage()
            ));
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubmissionResponse> getAllSubmissions(Pageable pageable) {
        return submissionRepository.findAll(pageable).map(SubmissionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getAdminSubmission(Long id) {
        return SubmissionMapper.toResponse(findSubmission(id));
    }

    private Submission loadOwnedOrAdminSubmission(Long id) {
        if (SecurityUtils.isAdmin()) {
            return findSubmission(id);
        }
        return submissionRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, "You cannot access this submission"));
    }

    private Submission findSubmission(Long id) {
        return submissionRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "Submission not found"));
    }

    private User currentUserEntity() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    }
}
