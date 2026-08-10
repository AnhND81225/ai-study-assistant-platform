package com.example.eduaiplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleTokenInfoResponse(
        String aud,
        String sub,
        String email,
        @JsonProperty("email_verified") Boolean emailVerified,
        String name
) {
}
