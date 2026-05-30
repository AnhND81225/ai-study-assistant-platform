package com.example.eduaiplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GradeRequest(
        @NotBlank @Size(max = 4000) String userAnswer
) {
}
