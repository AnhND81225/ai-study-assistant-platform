package com.example.eduaiplatform.entity;

import jakarta.persistence.*;

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

    @Column(length = 100)
    private String modelName;

    protected AiResponse() {
    }

    public AiResponse(Submission submission, String detectedQuestion, String explanation, String finalAnswer, String modelName) {
        this.submission = submission;
        this.detectedQuestion = detectedQuestion;
        this.explanation = explanation;
        this.finalAnswer = finalAnswer;
        this.modelName = modelName;
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

    public String getModelName() {
        return modelName;
    }
}
