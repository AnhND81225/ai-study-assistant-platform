package com.example.eduaiplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 300) String description
) {
}
