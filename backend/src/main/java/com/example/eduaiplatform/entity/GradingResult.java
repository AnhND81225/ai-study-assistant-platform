package com.example.eduaiplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "grading_results")
public class GradingResult extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(columnDefinition = "text", nullable = false)
    private String userAnswer;

    @Column(nullable = false)
    private Integer score;

    @Column(columnDefinition = "text")
    private String feedback;

    @Column(columnDefinition = "text")
    private String mistakes;

    @Column(columnDefinition = "text")
    private String improvementSuggestions;

    protected GradingResult() {
    }

    public GradingResult(Submission submission, String userAnswer, Integer score, String feedback, String mistakes, String improvementSuggestions) {
        this.submission = submission;
        this.userAnswer = userAnswer;
        this.score = score;
        this.feedback = feedback;
        this.mistakes = mistakes;
        this.improvementSuggestions = improvementSuggestions;
    }

    public Long getId() {
        return id;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public Integer getScore() {
        return score;
    }

    public String getFeedback() {
        return feedback;
    }

    public String getMistakes() {
        return mistakes;
    }

    public String getImprovementSuggestions() {
        return improvementSuggestions;
    }
}
