package com.example.eduaiplatform.entity;

import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "ai_responses")
public class AiResponse extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private Submission submission;

    @Column(columnDefinition = "text")
    private String detectedQuestion;

    @Column(columnDefinition = "text", nullable = false)
    private String explanation;

    @Column(columnDefinition = "text")
    private String finalAnswer;

    @Column(columnDefinition = "text")
    private String inputWarning;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private AiQuestionType questionType;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private AiResultStatus resultStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private AiSolveMode solveMode;

    @Column(columnDefinition = "text")
    private String availableQuestions;

    private Integer selectedQuestionNumber;

    @Column(length = 100)
    private String modelName;

    protected AiResponse() {
    }

    public AiResponse(
            Submission submission,
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String inputWarning,
            AiQuestionType questionType,
            AiResultStatus resultStatus,
            AiSolveMode solveMode,
            List<Integer> availableQuestions,
            Integer selectedQuestionNumber,
            String modelName
    ) {
        this.submission = submission;
        updateAnalysis(
                detectedQuestion,
                explanation,
                finalAnswer,
                inputWarning,
                questionType,
                resultStatus,
                solveMode,
                availableQuestions,
                selectedQuestionNumber,
                modelName
        );
    }

    public Long getId() {
        return id;
    }

    public String getDetectedQuestion() {
        return detectedQuestion;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getFinalAnswer() {
        return finalAnswer;
    }

    public String getInputWarning() {
        return inputWarning;
    }

    public AiQuestionType getQuestionType() {
        return questionType;
    }

    public AiResultStatus getResultStatus() {
        return resultStatus;
    }

    public AiSolveMode getSolveMode() {
        return solveMode;
    }

    public List<Integer> getAvailableQuestions() {
        if (availableQuestions == null || availableQuestions.isBlank()) {
            return List.of();
        }
        return Arrays.stream(availableQuestions.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(Integer::valueOf)
                .toList();
    }

    public Integer getSelectedQuestionNumber() {
        return selectedQuestionNumber;
    }

    public String getModelName() {
        return modelName;
    }

    /**
     * Reuses the same one-to-one response row when a user selects a question after
     * the initial scan. This keeps the submission history clean and avoids orphaned
     * AI responses while still allowing a selection-required scan to become a solution.
     */
    public void updateAnalysis(
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String inputWarning,
            AiQuestionType questionType,
            AiResultStatus resultStatus,
            AiSolveMode solveMode,
            List<Integer> availableQuestions,
            Integer selectedQuestionNumber,
            String modelName
    ) {
        this.detectedQuestion = detectedQuestion;
        this.explanation = explanation;
        this.finalAnswer = finalAnswer;
        this.inputWarning = inputWarning;
        this.questionType = questionType;
        this.resultStatus = resultStatus;
        this.solveMode = solveMode;
        this.availableQuestions = availableQuestions == null
                ? null
                : availableQuestions.stream().map(String::valueOf).reduce((left, right) -> left + "," + right).orElse(null);
        this.selectedQuestionNumber = selectedQuestionNumber;
        this.modelName = modelName;
    }
}
