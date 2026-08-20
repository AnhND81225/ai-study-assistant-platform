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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_solution_id")
    private QuestionSolution questionSolution;

    @Column(columnDefinition = "text", nullable = false)
    private String userAnswer;

    @Column(length = 1000)
    private String userAnswerImageUrl;

    @Column(length = 300)
    private String userAnswerCloudinaryPublicId;

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
        this(submission, null, userAnswer, null, null, score, feedback, mistakes, improvementSuggestions);
    }

    public GradingResult(Submission submission, QuestionSolution questionSolution, String userAnswer, Integer score, String feedback, String mistakes, String improvementSuggestions) {
        this(submission, questionSolution, userAnswer, null, null, score, feedback, mistakes, improvementSuggestions);
    }

    public GradingResult(Submission submission, String userAnswer, String userAnswerImageUrl, String userAnswerCloudinaryPublicId, Integer score, String feedback, String mistakes, String improvementSuggestions) {
        this(submission, null, userAnswer, userAnswerImageUrl, userAnswerCloudinaryPublicId, score, feedback, mistakes, improvementSuggestions);
    }

    public GradingResult(Submission submission, QuestionSolution questionSolution, String userAnswer, String userAnswerImageUrl, String userAnswerCloudinaryPublicId, Integer score, String feedback, String mistakes, String improvementSuggestions) {
        this.submission = submission;
        this.questionSolution = questionSolution;
        this.userAnswer = userAnswer;
        this.userAnswerImageUrl = userAnswerImageUrl;
        this.userAnswerCloudinaryPublicId = userAnswerCloudinaryPublicId;
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

    public QuestionSolution getQuestionSolution() {
        return questionSolution;
    }

    public String getUserAnswerImageUrl() {
        return userAnswerImageUrl;
    }

    public String getUserAnswerCloudinaryPublicId() {
        return userAnswerCloudinaryPublicId;
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
