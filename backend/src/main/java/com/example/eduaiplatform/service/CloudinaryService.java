package com.example.eduaiplatform.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    UploadResult uploadHomeworkImage(MultipartFile file);
    UploadResult uploadStudentAnswerImage(MultipartFile file);
    void deleteAsset(String publicId);

    record UploadResult(String imageUrl, String publicId) {
    }
}
