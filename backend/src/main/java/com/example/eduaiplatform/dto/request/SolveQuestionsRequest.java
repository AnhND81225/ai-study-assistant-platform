package com.example.eduaiplatform.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SolveQuestionsRequest(
        @NotEmpty
        @Size(max = 3)
        List<@Positive Integer> questionNumbers
) {
}
