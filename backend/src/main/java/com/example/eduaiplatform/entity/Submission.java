package com.example.eduaiplatform.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "submissions", indexes = {
        @Index(name = "idx_submissions_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_submissions_subject", columnList = "subject_id")
})
public class Submission extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(length = 300)
    private String cloudinaryPublicId;

    @Column(length = 255)
    private String originalFileName;

    @Column(length = 120)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SubmissionStatus status = SubmissionStatus.UPLOADED;

    @Column(length = 600)
    private String note;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean favorite = false;

    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private AiResponse aiResponse;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GradingResult> gradingResults = new ArrayList<>();

    protected Submission() {
    }

    public Submission(User user, Subject subject, String imageUrl, String cloudinaryPublicId, String originalFileName, String note) {
        this.user = user;
        this.subject = subject;
        this.imageUrl = imageUrl;
        this.cloudinaryPublicId = cloudinaryPublicId;
        this.originalFileName = originalFileName;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Subject getSubject() {
        return subject;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCloudinaryPublicId() {
        return cloudinaryPublicId;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public String getTitle() {
        return title;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public AiResponse getAiResponse() {
        return aiResponse;
    }

    public List<GradingResult> getGradingResults() {
        return gradingResults;
    }

    public void markExplained(AiResponse response) {
        this.aiResponse = response;
        this.status = SubmissionStatus.EXPLAINED;
    }

    public void markAiFailed() {
        this.status = SubmissionStatus.AI_FAILED;
    }

    public void updateStudyMetadata(String title, String note, Boolean favorite) {
        this.title = normalize(title);
        this.note = normalize(note);
        if (favorite != null) {
            this.favorite = favorite;
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
