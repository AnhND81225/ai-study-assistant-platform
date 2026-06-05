package com.example.eduaiplatform.mapper;

import com.example.eduaiplatform.dto.response.*;
import com.example.eduaiplatform.entity.*;
import java.util.List;

public final class SubmissionMapper {
    private SubmissionMapper() {
    }

    public static SubmissionResponse toResponse(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getUser().getId(),
                submission.getUser().getEmail(),
                SubjectMapper.toResponse(submission.getSubject()),
                submission.getImageUrl(),
                submission.getOriginalFileName(),
                submission.getTitle(),
                submission.getStatus().name(),
                submission.getNote(),
                submission.isFavorite(),
                toAiResponse(submission.getAiResponse()),
                submission.getGradingResults().stream().map(SubmissionMapper::toGradingResponse).toList(),
                submission.getCreatedAt(),
                submission.getUpdatedAt()
        );
    }

    public static AiExplanationResponse toAiResponse(AiResponse response) {
        if (response == null) {
            return null;
        }
        return new AiExplanationResponse(
                response.getId(),
                response.getDetectedQuestion(),
                response.getExplanation(),
                response.getFinalAnswer(),
                response.getModelName()
        );
    }

    public static GradingResultResponse toGradingResponse(GradingResult result) {
        return new GradingResultResponse(
                result.getId(),
                result.getUserAnswer(),
                result.getUserAnswerImageUrl(),
                result.getScore(),
                result.getFeedback(),
                result.getMistakes(),
                result.getImprovementSuggestions(),
                result.getCreatedAt()
        );
    }

    public static List<SubmissionResponse> toResponseList(List<Submission> submissions) {
        return submissions.stream().map(SubmissionMapper::toResponse).toList();
    }
}
