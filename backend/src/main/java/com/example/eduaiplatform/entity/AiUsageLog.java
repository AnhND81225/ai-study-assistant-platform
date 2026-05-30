package com.example.eduaiplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_usage_logs", indexes = {
        @Index(name = "idx_ai_usage_user_created", columnList = "user_id, created_at")
})
public class AiUsageLog extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AiRequestType requestType;

    @Column(length = 100)
    private String modelName;

    private Integer inputTokens;
    private Integer outputTokens;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AiUsageStatus status;

    @Column(length = 500)
    private String errorMessage;

    protected AiUsageLog() {
    }

    public AiUsageLog(User user, Submission submission, AiRequestType requestType, String modelName, Integer inputTokens, Integer outputTokens, AiUsageStatus status, String errorMessage) {
        this.user = user;
        this.submission = submission;
        this.requestType = requestType;
        this.modelName = modelName;
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    public Long getId() {
        return id;
    }

    public AiRequestType getRequestType() {
        return requestType;
    }

    public String getModelName() {
        return modelName;
    }

    public Integer getInputTokens() {
        return inputTokens;
    }

    public Integer getOutputTokens() {
        return outputTokens;
    }

    public AiUsageStatus getStatus() {
        return status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
