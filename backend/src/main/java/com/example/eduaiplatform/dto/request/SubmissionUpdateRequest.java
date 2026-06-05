package com.example.eduaiplatform.dto.request;

import jakarta.validation.constraints.Size;

public record SubmissionUpdateRequest(
        @Size(max = 120) String title,
        @Size(max = 600) String note,
        Boolean favorite
) {
}
