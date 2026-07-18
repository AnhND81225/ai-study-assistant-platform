# Architecture

## System Overview

AI Study Assistant Platform has a Spring Boot REST API, React mobile-first PWA frontend, PostgreSQL database, Cloudinary image storage, and an AI provider integration for explanation and grading.

## Backend Architecture

The backend uses layered architecture:

- Controllers receive HTTP requests and return DTO responses.
- Services contain business logic, authorization checks, ownership checks, and transaction boundaries.
- Repositories handle database access.
- DTOs define the API boundary.
- Mappers convert entities to responses.
- Security validates JWT and enforces RBAC.
- Exceptions are handled centrally.

## Frontend Architecture

The frontend uses feature-based structure:

- `api`: Axios client and endpoint modules.
- `auth`: auth state and session helpers.
- `components`: reusable UI.
- `features`: domain flows.
- `pages`: route-level pages.
- `routes`: protected and role-based routing.
- `pwa`: service worker and install helpers.

## Mobile-First Architecture

The primary layout targets phones first. User pages use large tap targets, card/list layouts, simple upload flow, safe spacing, and bottom navigation. Admin pages can use responsive tables on desktop and stacked cards on mobile.

## PWA Architecture

The PWA provides a manifest, standalone display mode, icons, safe static asset caching, an install prompt banner, and online/offline status messaging. Private API responses are not cached. Offline mode shows a fallback page and does not pretend AI features work offline.

## AI Workflow

Explanation flow:

1. User uploads an image.
2. Backend validates file type and size.
3. Backend uploads the file to Cloudinary.
4. Backend creates a submission.
5. Backend sends the image URL, subject, optional note, and requested solve scope to the AI provider.
6. AI classifies the image as a single question, multi-question page, or multiple-choice page.
7. When several questions are detected without a selected scope, backend stores `QUESTION_SELECTION_REQUIRED` instead of a generic solution.
8. User selects up to three detected questions.
9. Backend reuses already-saved question solutions and sends only missing questions to the provider in one image request.
10. Backend validates that every requested question has exactly one structured result.
11. Backend stores each solution independently and returns the updated submission.

Grading flow:

1. User submits an answer for their own submission.
2. Backend loads the submission and the selected saved question solution, or the legacy single-question explanation.
3. Backend sends compact context to the AI provider.
4. Backend validates the score and structured response fields.
5. Backend stores score, feedback, mistakes, suggestions, and the associated question solution.

The uploaded image is the primary source of truth. Notes are optional context and may identify a target such as "solve question 5." Unrelated notes are ignored with a user-facing warning, while unresolved image-note conflicts are rejected before data is stored.

### Multi-question Routing

`AiResultStatus` separates a real solution from an intermediate scan:

- `SOLUTION_READY`: one complete scope was solved.
- `QUESTION_SELECTION_REQUIRED`: several questions were found and the user must choose.
- `INCOMPLETE_IMAGE`: the selected question is cropped or unreadable.
- `PARTIAL_RESULT`: an explicit page-wide request completed only for readable questions.

`AiSolveMode` keeps user intent explicit: `AUTO`, `ONE_QUESTION`, `ANSWERS_ONLY`, and `EXPLAIN_ALL`. This prevents the provider from randomly deciding whether to describe, solve, or answer an entire page.

Usage quota flow:

1. Backend logs AI requests with request type, model, status, and timestamp.
2. A multi-question detection scan is logged with zero solve credits.
3. Successful scans have a separate daily cap to prevent unlimited zero-credit provider calls.
4. Each newly generated question solution costs one credit, including questions solved together in one provider request.
5. Previously saved question solutions are reused without another provider call or credit.
6. The frontend reads `/api/ai-usage/me` to show the remaining daily solve quota.
7. The backend enforces available credits before generating missing solutions.

## Upload Workflow

The frontend uses a shared scanner input for explain and grade flows. It supports mobile camera capture, gallery selection, preview, 90-degree rotation, and clearing the selected file before upload. Only `jpg`, `jpeg`, `png`, and `webp` are allowed. The backend remains the source of truth for file validation and checks type and size before Cloudinary upload. Cloudinary URL and public ID are stored with the submission.

## Delete Submission Workflow

MVP uses hard delete. A USER can delete only their own submission. Related AI response and grading results are removed through cascade relationships. Cloudinary asset deletion is attempted using the stored public ID.

## History Management Workflow

Users can search and filter their own submissions by subject, status, favorite flag, and text. The backend enforces ownership for all history queries and metadata updates. Users can edit a saved title/note and mark submissions as favorites without changing the AI explanation or grading records.

## Auth Workflow

Register creates a USER account with BCrypt password hash. Login returns a JWT. Backend extracts identity from Spring Security context. Frontend stores token for MVP simplicity and clears it on logout or unauthorized responses.

## Database Relationship Overview

- User 1-n Submission
- Role 1-n User
- Subject 1-n Submission
- Submission 1-1 AiResponse
- Submission 1-n QuestionSolution
- Submission 1-n GradingResult
- QuestionSolution 1-n GradingResult
- User 1-n AiUsageLog

## Deployment Architecture

- Vercel serves the React PWA.
- Render runs the Spring Boot API.
- Neon hosts PostgreSQL.
- Cloudinary stores uploaded images.

## Docker/Local Development

Docker Compose starts PostgreSQL, backend, and frontend services for local development. Docker is not required for production deployment.

## Performance Considerations

- Pagination for history and admin lists.
- Entity graphs or focused DTO queries to reduce N+1 risk.
- External API timeouts.
- Compact AI prompts.
- Daily AI quota visibility to reduce surprise failures and control cost.
- No unnecessary large payloads.

## Scalability Considerations

- AI provider abstraction allows future OpenAI/Gemini switching.
- Subjects are database-driven.
- AI jobs can be moved to async processing later.
- AI rate limiting can be added later.

## Security Considerations

- JWT validation.
- RBAC.
- Service-layer ownership checks.
- File upload validation.
- Explicit CORS.
- No secret logging.
- No private API cache in service worker.
