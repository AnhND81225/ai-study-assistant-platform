package com.example.eduaiplatform.service.impl;

import com.example.eduaiplatform.config.GoogleAuthProperties;
import com.example.eduaiplatform.dto.response.GoogleTokenInfoResponse;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.GoogleTokenVerifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class GoogleTokenVerifierImpl implements GoogleTokenVerifier {
    private final GoogleAuthProperties properties;
    private final RestClient restClient;

    public GoogleTokenVerifierImpl(GoogleAuthProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.baseUrl("https://oauth2.googleapis.com").build();
    }

    @Override
    public GoogleTokenInfoResponse verify(String credential) {
        if (properties.getClientId() == null || properties.getClientId().isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.AUTH_PROVIDER_ERROR, "Google sign-in is not configured");
        }
        GoogleTokenInfoResponse tokenInfo;
        try {
            tokenInfo = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", credential).build())
                    .retrieve()
                    .body(GoogleTokenInfoResponse.class);
        } catch (RestClientException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED, "Google sign-in could not be verified");
        }
        if (tokenInfo == null
                || tokenInfo.aud() == null
                || !tokenInfo.aud().equals(properties.getClientId())
                || tokenInfo.sub() == null
                || tokenInfo.email() == null
                || !Boolean.TRUE.equals(tokenInfo.emailVerified())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_FAILED, "Google sign-in could not be verified");
        }
        return tokenInfo;
    }
}
