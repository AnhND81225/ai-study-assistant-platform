package com.example.eduaiplatform.service.impl;

import com.cloudinary.Cloudinary;
import com.example.eduaiplatform.exception.ApiException;
import com.example.eduaiplatform.exception.ErrorCode;
import com.example.eduaiplatform.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private final Cloudinary cloudinary;
    private final long maxBytes;

    public CloudinaryServiceImpl(Cloudinary cloudinary, @Value("${app.upload.max-size-mb}") long maxMb) {
        this.cloudinary = cloudinary;
        this.maxBytes = maxMb * 1024 * 1024;
    }

    @Override
    public UploadResult uploadHomeworkImage(MultipartFile file) {
        validate(file);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), Map.of(
                    "folder", "ai-study-assistant/homework",
                    "resource_type", "image"
            ));
            return new UploadResult(String.valueOf(result.get("secure_url")), String.valueOf(result.get("public_id")));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, ErrorCode.EXTERNAL_SERVICE_ERROR, "Image upload failed");
        }
    }

    @Override
    public void deleteAsset(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, Map.of("resource_type", "image"));
        } catch (IOException ignored) {
            // Deletion is best-effort so a transient Cloudinary issue does not expose private data through the API response.
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.UNSAFE_FILE_UPLOAD, "Image file is required");
        }
        if (file.getSize() > maxBytes) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, ErrorCode.UNSAFE_FILE_UPLOAD, "Image file is too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.UNSAFE_FILE_UPLOAD, "Only jpg, jpeg, png, and webp images are allowed");
        }
    }
}
