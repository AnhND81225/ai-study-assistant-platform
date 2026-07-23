# Security

## JWT Security

JWTs are signed with a backend secret. The backend validates every protected request and extracts user identity from Spring Security context.

## RBAC

Roles are `GUEST`, `USER`, and `ADMIN`. Backend authorization is the source of truth. Frontend route protection is only for UX.

## IDOR Prevention

Submission endpoints must verify ownership in the service layer. A USER can only view, explain, grade, or delete submissions where `submission.user.id` equals the authenticated user id.

## Delete-Own-Submission Security

USER deletion requires authentication and ownership. Non-owned submission deletion returns a forbidden response. ADMIN deletion can be provided through admin-only endpoints.

## CORS

CORS must use explicit frontend origins from environment variables. Do not use wildcard origins with credentials. Backend API origins such as `https://api.ducanh.space` belong in the frontend `VITE_API_BASE_URL`; frontend origins such as Vercel or `https://ducanh.space` belong in backend `CORS_ALLOWED_ORIGINS`.

## File Upload Validation

Allowed types: `jpg`, `jpeg`, `png`, `webp`. Backend validates file size and type before Cloudinary upload.

## Input Validation

Use request DTO validation with `jakarta.validation`.

## Secret Management

Do not hardcode or commit secrets. Do not log secrets, JWTs, passwords, or API keys.

## AI Security

Do not rely on AI for authorization. Keep prompts compact and avoid sending unnecessary private data. The frontend must never call OpenAI directly or receive `OPENAI_API_KEY`; the Spring Boot backend is the only OpenAI caller.

Each normal user is limited to a configurable number of successful AI explanation requests per day through `AI_EXPLAIN_LIMIT_PER_USER`.

Uploaded images are the primary source of truth. User notes are treated as untrusted optional context and must not override the required response format or provider instructions. AI responses are validated before persistence; truncated, malformed, nested-JSON, invalid-score, and unresolved input-conflict responses are rejected.

## Frontend Token Handling

MVP token storage is simple and must be treated as XSS-sensitive. Clear the token on logout and unauthorized responses.

## PWA Cache Privacy

Do not cache private API responses. Cache only safe static assets.

## Checklist

- JWT validation
- RBAC bypass
- IDOR
- SQL injection risk
- Unsafe file upload
- Exposed secrets
- Insecure CORS
- Weak input validation
- Unsafe error response
- XSS risk in React
- Token storage risk
- PWA cache privacy risk
- Public access to private resources
