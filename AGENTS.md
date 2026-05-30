# AI Study Assistant Platform - Agent Guide

## Project Overview

AI Study Assistant Platform is a CV-ready learning project with a Java Spring Boot backend, React frontend, mobile-first PWA behavior, PostgreSQL database, Cloudinary image storage, and OpenAI/Gemini-ready AI integration.

## Working Rules

- Inspect the project structure before changing code.
- Propose a clear plan before broad changes.
- Wait for user approval before editing files at the start of a task.
- Work in small, safe phases and summarize each phase.
- Do not over-engineer the MVP.
- Do not fake implemented features.
- Do not commit real secrets, API keys, tokens, or `.env` files.
- Do not read, print, copy, summarize, or request the contents of `.env` files or any real secret file. Only check whether expected secret variables are present or empty using redacted commands that never reveal values.

## Backend Rules

- Use layered architecture: `controller`, `service`, `service/impl`, `repository`, `entity`, `dto`, `mapper`, `config`, `security`, `exception`, `util`, and `validation`.
- Keep controllers thin.
- Put business logic in services.
- Do not expose JPA entities directly.
- Use DTOs for API requests and responses.
- Use centralized exception handling.
- Use `jakarta.validation` annotations.
- Use environment variables for secrets and deployment-specific configuration.

## Frontend Rules

- Use mobile-first feature-based architecture: `api`, `app`, `components`, `features`, `pages`, `routes`, `hooks`, `layouts`, `utils`, and `pwa`.
- Use a centralized Axios client.
- Use protected routes and role-based routes.
- Keep API logic separate from UI components.
- Add loading, error, empty, and success states.
- Support PWA installability.
- Do not cache private API responses in the service worker.

## Security Rules

- Enforce JWT authentication on the backend.
- Enforce RBAC on the backend.
- Prevent IDOR by checking resource ownership in services.
- Validate file upload type and size.
- Allow USER accounts to delete only their own submissions.
- Never log secrets, JWTs, API keys, or passwords.
- Never commit `.env` files.
- Never open or display `.env` file contents. For troubleshooting, use presence checks such as `KEY=present` or `KEY=EMPTY` only.
- Configure CORS with explicit allowed origins.
- Safely render AI-generated content in React.

## Performance Rules

- Use pagination for list APIs.
- Avoid N+1 query problems.
- Avoid returning unnecessary large payloads.
- Add timeout handling for external AI calls.
- Avoid unnecessary frontend re-renders.
- Show loading states for upload and AI processing.
- Keep PWA caching simple and safe.

## Scalability Rules

- Keep modules separated by responsibility.
- Use an AI provider abstraction.
- Make it easy to add new AI providers and subjects later.
- Keep future async processing possible for long AI jobs.
- Suggest rate limiting for AI-heavy endpoints.

## Documentation Rules

- Keep `README.md` updated.
- Keep `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/PWA.md`, and `docs/CV_NOTES.md` updated.
- Keep `backend/.env.example` and `frontend/.env.example` updated.

## Docker Rules

- Keep Docker simple and useful for local development.
- Do not hardcode secrets in Dockerfiles or Compose.
- Use environment variables.
- Commit only example env files.
- Prefer a multi-stage backend Dockerfile.
- Use Docker Compose for local backend, frontend, and PostgreSQL.

## Plugin Guidance

- GitHub: repository, branches, PRs, CI, and review context.
- OpenAI Developers: AI workflow, prompt, model, and cost decisions.
- Codex Security: security review and risk validation.
- Chrome: frontend, mobile responsive, and PWA testing.
- Vercel: frontend deployment readiness.
- Render: backend deployment readiness.
- Neon Postgres: cloud database setup.
- Cloudinary: image upload workflow.
- Sentry: production monitoring when suitable.
