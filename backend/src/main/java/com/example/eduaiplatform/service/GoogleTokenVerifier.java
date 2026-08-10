package com.example.eduaiplatform.service;

import com.example.eduaiplatform.dto.response.GoogleTokenInfoResponse;

public interface GoogleTokenVerifier {
    GoogleTokenInfoResponse verify(String credential);
}
