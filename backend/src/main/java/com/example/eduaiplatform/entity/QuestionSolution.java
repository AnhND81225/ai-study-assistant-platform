package com.example.eduaiplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "question_solutions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_question_solutions_submission_number",
                columnNames = {"submission_id", "question_number"}
        ),
        indexes = @Index(
                name = "idx_question_solutions_submission",
                columnList = "submission_id"
        )
)
public class QuestionSolution extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "detected_question", nullable = false, columnDefinition = "text")
    private String detectedQuestion;

    @Column(nullable = false, columnDefinition = "text")
    private String explanation;

    @Column(name = "final_answer", nullable = false, columnDefinition = "text")
    private String finalAnswer;

    @Column(name = "model_name", length = 100)
    private String modelName;

    protected QuestionSolution() {
    }

    public QuestionSolution(
            Submission submission,
            Integer questionNumber,
            String detectedQuestion,
            String explanation,
            String finalAnswer,
            String modelName
    ) {
        this.submission = submission;
        this.questionNumber = questionNumber;
        this.detectedQuestion = detectedQuestion;
        this.explanation = explanation;
        this.finalAnswer = finalAnswer;
        this.modelName = modelName;
    }

    public Long getId() {
        return id;
    }

    public Integer getQuestionNumber() {
        return questionNumber;
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

    public String getModelName() {
        return modelName;
    }
}
