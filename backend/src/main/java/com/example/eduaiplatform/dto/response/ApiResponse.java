package com.example.eduaiplatform.dto.response;

import java.util.List;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String errorCode,
        List<String> details
) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, List.of());
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, List<String> details) {
        return new ApiResponse<>(false, message, null, errorCode, details == null ? List.of() : details);
    }
}
