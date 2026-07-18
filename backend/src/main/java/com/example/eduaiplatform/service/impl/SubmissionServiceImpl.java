package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.dto.request.GradeRequest;
import com.example.eduaiplatform.dto.request.SolveQuestionsRequest;
import com.example.eduaiplatform.dto.request.SubmissionUpdateRequest;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final AiResponseRepository aiResponseRepository;
    private final GradingResultRepository gradingResultRepository;
    private final QuestionSolutionRepository questionSolutionRepository;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final CloudinaryService cloudinaryService;
    private final AiService aiService;
    private final long explainLimitPerUser;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            AiResponseRepository aiResponseRepository,
            GradingResultRepository gradingResultRepository,
            QuestionSolutionRepository questionSolutionRepository,
            AiUsageLogRepository aiUsageLogRepository,
            CloudinaryService cloudinaryService,
            AiService aiService,
            @Value("${app.ai.explain-limit-per-user}") long explainLimitPerUser
    ) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.aiResponseRepository = aiResponseRepository;
        this.gradingResultRepository = gradingResultRepository;
        this.questionSolutionRepository = questionSolutionRepository;
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.cloudinaryService = cloudinaryService;
        this.aiService = aiService;
        this.explainLimitPerUser = explainLimitPerUser;
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
    public Page<SubmissionResponse> getMySubmissions(Pageable pageable, Long subjectId, String status, Boolean favorite, String search) {
        return submissionRepository.searchByUser(
                        SecurityUtils.currentUserId(),
                        subjectId,
                        parseStatus(status),
                        favorite,
                        normalizeSearch(search),
                        pageable
                )
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
    public SubmissionResponse updateSubmission(Long id, SubmissionUpdateRequest request) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        submission.updateStudyMetadata(request.title(), request.note(), request.favorite());
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
        List<String> gradingImagePublicIds = submission.getGradingResults().stream()
                .map(GradingResult::getUserAnswerCloudinaryPublicId)
                .toList();
        aiUsageLogRepository.clearSubmissionReference(submission.getId());
        submissionRepository.delete(submission);
        gradingImagePublicIds.forEach(cloudinaryService::deleteAsset);
        cloudinaryService.deleteAsset(publicId);
    }

    @Override
    @Transactional
    public SubmissionResponse explainSubmission(Long id, Integer questionNumber, AiSolveMode solveMode) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        AiSolveMode requestedMode = solveMode == null ? AiSolveMode.AUTO : solveMode;
        validateExplainRequest(questionNumber, requestedMode);
        if (submission.getAiResponse() != null && questionNumber == null && requestedMode == AiSolveMode.AUTO) {
            return SubmissionMapper.toResponse(submission);
        }
        if (questionNumber == null && requestedMode == AiSolveMode.AUTO) {
            enforceScanLimit();
        }
        int requestedCredits = explainCredits(submission, requestedMode);
        enforceExplainLimit(requestedCredits);
        try {
            AiService.AiExplanationResult result = aiService.explain(
                    submission.getImageUrl(),
                    submission.getSubject().getName(),
                    submission.getNote(),
                    questionNumber,
                    requestedMode
            );
            AiResponse response = submission.getAiResponse();
            if (response == null) {
                response = new AiResponse(
                        submission,
                        result.detectedQuestion(),
                        result.explanation(),
                        result.finalAnswer(),
                        result.inputWarning(),
                        result.questionType(),
                        result.resultStatus(),
                        result.solveMode(),
                        result.availableQuestions(),
                        result.selectedQuestionNumber(),
                        result.modelName()
                );
            } else {
                response.updateAnalysis(
                        result.detectedQuestion(),
                        result.explanation(),
                        result.finalAnswer(),
                        result.inputWarning(),
                        result.questionType(),
                        result.resultStatus(),
                        result.solveMode(),
                        result.availableQuestions(),
                        result.selectedQuestionNumber(),
                        result.modelName()
                );
            }
            aiResponseRepository.save(response);
            submission.markAiResult(response, result.resultStatus());
            boolean scanOnly = result.resultStatus() == AiResultStatus.QUESTION_SELECTION_REQUIRED;
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    scanOnly ? AiRequestType.SCAN : AiRequestType.EXPLAIN,
                    result.modelName(),
                    result.inputTokens(),
                    result.outputTokens(),
                    AiUsageStatus.SUCCESS,
                    null,
                    scanOnly ? 0 : requestedCredits
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
    public SubmissionResponse solveQuestions(Long id, SolveQuestionsRequest request) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        AiResponse scan = submission.getAiResponse();
        if (scan == null || scan.getAvailableQuestions().isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Scan the worksheet before choosing questions"
            );
        }

        List<Integer> selected = request.questionNumbers().stream().distinct().sorted().toList();
        if (selected.isEmpty() || selected.size() > 3) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Choose between one and three questions"
            );
        }
        if (!scan.getAvailableQuestions().containsAll(selected)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Choose only question numbers detected in this worksheet"
            );
        }

        List<QuestionSolution> existing = questionSolutionRepository
                .findBySubmissionIdAndQuestionNumberInOrderByQuestionNumber(id, selected);
        List<Integer> missing = selected.stream()
                .filter(number -> existing.stream().noneMatch(solution -> solution.getQuestionNumber().equals(number)))
                .toList();
        if (missing.isEmpty()) {
            return SubmissionMapper.toResponse(submission);
        }

        enforceExplainLimit(missing.size());
        try {
            AiService.AiQuestionBatchResult result = aiService.explainQuestions(
                    submission.getImageUrl(),
                    submission.getSubject().getName(),
                    submission.getNote(),
                    missing
            );
            List<QuestionSolution> created = result.solutions().stream()
                    .map(solution -> new QuestionSolution(
                            submission,
                            solution.questionNumber(),
                            solution.detectedQuestion(),
                            solution.explanation(),
                            solution.finalAnswer(),
                            result.modelName()
                    ))
                    .toList();
            questionSolutionRepository.saveAll(created);
            submission.getQuestionSolutions().addAll(created);
            submission.markQuestionsSolved();
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.EXPLAIN,
                    result.modelName(),
                    result.inputTokens(),
                    result.outputTokens(),
                    AiUsageStatus.SUCCESS,
                    null,
                    missing.size()
            ));
            return SubmissionMapper.toResponse(submission);
        } catch (ApiException ex) {
            aiUsageLogRepository.save(new AiUsageLog(
                    currentUserEntity(),
                    submission,
                    AiRequestType.EXPLAIN,
                    null,
                    null,
                    null,
                    AiUsageStatus.FAILED,
                    ex.getMessage(),
                    0
            ));
            throw ex;
        }
    }

    @Override
    @Transactional
    public GradingResultResponse gradeSubmission(Long id, GradeRequest request) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        GradingContext context = resolveGradingContext(submission, request.questionSolutionId());
        try {
            AiService.AiGradingResult result = aiService.grade(
                    context.detectedQuestion(),
                    context.explanation(),
                    context.finalAnswer(),
                    request.userAnswer()
            );
            GradingResult gradingResult = gradingResultRepository.save(new GradingResult(
                    submission,
                    context.questionSolution(),
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
    @Transactional
    public GradingResultResponse gradeSubmissionImage(Long id, Long questionSolutionId, MultipartFile image) {
        Submission submission = loadOwnedOrAdminSubmission(id);
        GradingContext context = resolveGradingContext(submission, questionSolutionId);
        CloudinaryService.UploadResult upload = cloudinaryService.uploadStudentAnswerImage(image);
        try {
            AiService.AiGradingResult result = aiService.gradeImage(
                    context.detectedQuestion(),
                    context.explanation(),
                    context.finalAnswer(),
                    upload.imageUrl()
            );
            GradingResult gradingResult = gradingResultRepository.save(new GradingResult(
                    submission,
                    context.questionSolution(),
                    result.detectedStudentAnswer(),
                    upload.imageUrl(),
                    upload.publicId(),
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
            cloudinaryService.deleteAsset(upload.publicId());
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
    @Transactional
    public SubmissionResponse gradeNewWorkImage(Long subjectId, String note, MultipartFile image) {
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
        try {
            AiService.AiNewWorkGradingResult result = aiService.gradeNewWorkImage(
                    upload.imageUrl(),
                    subject.getName(),
                    note
            );
            AiResponse response = new AiResponse(
                    submission,
                    result.detectedQuestion(),
                    result.expectedExplanation(),
                    result.finalAnswer(),
                    result.inputWarning(),
                    AiQuestionType.SINGLE_QUESTION,
                    AiResultStatus.SOLUTION_READY,
                    AiSolveMode.AUTO,
                    List.of(),
                    null,
                    result.modelName()
            );
            aiResponseRepository.save(response);
            submission.markAiResult(response, AiResultStatus.SOLUTION_READY);

            gradingResultRepository.save(new GradingResult(
                    submission,
                    result.detectedStudentAnswer(),
                    null,
                    null,
                    result.score(),
                    result.feedback(),
                    result.mistakes(),
                    result.improvementSuggestions()
            ));
            aiUsageLogRepository.save(new AiUsageLog(
                    user,
                    submission,
                    AiRequestType.GRADE,
                    result.modelName(),
                    result.inputTokens(),
                    result.outputTokens(),
                    AiUsageStatus.SUCCESS,
                    null
            ));
            return SubmissionMapper.toResponse(submission);
        } catch (ApiException ex) {
            submission.markAiFailed();
            cloudinaryService.deleteAsset(upload.publicId());
            aiUsageLogRepository.save(new AiUsageLog(
                    user,
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

    private SubmissionStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return SubmissionStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid submission status filter");
        }
    }

    /**
     * Keeps ambiguous multi-question requests out of the provider call. Selecting a
     * question uses ONE_QUESTION, while page-wide modes intentionally omit a number.
     */
    private void validateExplainRequest(Integer questionNumber, AiSolveMode solveMode) {
        if (questionNumber != null && questionNumber < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Question number must be greater than zero");
        }
        if (solveMode == AiSolveMode.ONE_QUESTION && questionNumber == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Choose a question number to solve");
        }
        if (questionNumber != null && solveMode != AiSolveMode.ONE_QUESTION) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Use ONE_QUESTION when choosing a question number");
        }
    }

    private void requireGradableResult(AiResponse response) {
        AiResultStatus status = response.getResultStatus();
        if (status != null && status != AiResultStatus.SOLUTION_READY && status != AiResultStatus.PARTIAL_RESULT) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Choose and solve a complete question before checking a student answer"
            );
        }
    }

    private GradingContext resolveGradingContext(Submission submission, Long questionSolutionId) {
        if (questionSolutionId != null) {
            QuestionSolution solution = questionSolutionRepository.findByIdAndSubmissionId(
                            questionSolutionId,
                            submission.getId()
                    )
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.NOT_FOUND,
                            ErrorCode.RESOURCE_NOT_FOUND,
                            "Solved question not found for this submission"
                    ));
            return new GradingContext(
                    solution,
                    solution.getDetectedQuestion(),
                    solution.getExplanation(),
                    solution.getFinalAnswer()
            );
        }

        AiResponse response = submission.getAiResponse();
        if (response == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    "Generate an explanation before grading"
            );
        }
        requireGradableResult(response);
        return new GradingContext(
                null,
                response.getDetectedQuestion(),
                response.getExplanation(),
                response.getFinalAnswer()
        );
    }

    private String normalizeSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        return search.trim();
    }

    private User currentUserEntity() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
    }

    private int explainCredits(Submission submission, AiSolveMode solveMode) {
        if (solveMode == AiSolveMode.EXPLAIN_ALL || solveMode == AiSolveMode.ANSWERS_ONLY) {
            return Math.max(1, submission.getAiResponse() == null
                    ? 1
                    : submission.getAiResponse().getAvailableQuestions().size());
        }
        return 1;
    }

    private void enforceScanLimit() {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        long scans = aiUsageLogRepository.countByUserIdAndRequestTypeAndStatusAndCreatedAtGreaterThanEqual(
                SecurityUtils.currentUserId(),
                AiRequestType.SCAN,
                AiUsageStatus.SUCCESS,
                todayStart
        );
        if (scans >= explainLimitPerUser) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    ErrorCode.AI_USAGE_LIMIT_EXCEEDED,
                    "You have reached today's worksheet scan limit"
            );
        }
    }

    private void enforceExplainLimit(int requestedCredits) {
        if (SecurityUtils.isAdmin()) {
            return;
        }
        Instant todayStart = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        long used = aiUsageLogRepository.sumCreditsUsed(
                SecurityUtils.currentUserId(),
                AiRequestType.EXPLAIN,
                AiUsageStatus.SUCCESS,
                todayStart
        );
        if (used + requestedCredits > explainLimitPerUser) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    ErrorCode.AI_USAGE_LIMIT_EXCEEDED,
                    "You do not have enough daily solves remaining for this request"
            );
        }
    }

    private record GradingContext(
            QuestionSolution questionSolution,
            String detectedQuestion,
            String explanation,
            String finalAnswer
    ) {
    }
}
