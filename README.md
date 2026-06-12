# AI Study Assistant Platform

[![Build and Deploy Check](https://github.com/AnhND81225/ai-study-assistant-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/AnhND81225/ai-study-assistant-platform/actions/workflows/ci.yml)

A professional fullstack learning project where students upload an image of a homework question, receive an AI-generated step-by-step explanation, and optionally grade their own answer.

This project is designed to demonstrate fullstack development, backend architecture, mobile-first frontend design, PWA readiness, AI integration, security awareness, Docker local development, and deployment readiness.

## Key Features

- Register and login with JWT authentication.
- Role-based access control for `GUEST`, `USER`, and `ADMIN`.
- Mobile-first React UI.
- Scan homework images from camera or gallery with preview, rotate, and clear controls.
- Validate and store images with Cloudinary.
- AI explanation workflow with Markdown and LaTeX-ready responses.
- AI grading workflow for typed answers, answer images, or a new image containing both the question and student work.
- Daily AI explanation quota with user-visible remaining usage.
- Submission history with search, filters, favorites, editable notes, pagination, and delete-own-submission flow.
- Admin-ready API structure.
- PostgreSQL persistence.
- PWA manifest, service worker strategy, install prompt, and offline fallback.
- Docker Compose local development.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java, Spring Boot, Spring Security, JPA/Hibernate, Maven |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS |
| Database | PostgreSQL |
| Storage | Cloudinary |
| AI | OpenAI-compatible provider abstraction |
| PWA | Vite PWA plugin, web manifest, service worker |
| Local Dev | Docker, Docker Compose |
| Deployment | Vercel frontend, Render backend, Neon Postgres |

## Architecture Overview

The backend follows a layered architecture with controllers, services, repositories, DTOs, mappers, security, and centralized exception handling. The frontend uses a mobile-first feature architecture with centralized API access, auth state, protected routes, reusable components, and PWA support.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Folder Structure

```text
backend/
  src/main/java/com/example/eduaiplatform/
frontend/
  src/
docs/
docker-compose.yml
AGENTS.md
README.md
```

## Backend Setup

```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

The backend runs on `http://localhost:8080` by default.

Seeded admin account for local development:

```text
Email: admin@example.com
Password: Admin123!
```

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## PWA Installation

Android:

1. Open the deployed frontend in Chrome.
2. Tap the browser menu.
3. Choose **Install app** or **Add to Home screen**.

iOS:

1. Open the deployed frontend in Safari.
2. Tap the share button.
3. Choose **Add to Home Screen**.

AI explanation, grading, login, upload, and history require an internet connection. Offline mode only serves the static fallback and safe cached assets.

When supported by the browser, the app shows an install banner. Authenticated screens also show an offline warning and block AI/upload actions while offline.

See [docs/PWA.md](docs/PWA.md).

## Docker Setup

Prerequisites:

- Docker
- Docker Compose

Run the full stack locally:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

View logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

Rebuild:

```bash
docker compose up --build --force-recreate
```

Connect to local PostgreSQL:

```bash
docker compose exec postgres psql -U eduaidb_user -d eduaidb
```

From host tools, use port `55432` because Compose maps PostgreSQL to `localhost:55432` to avoid conflicts with a local PostgreSQL install.

Docker is for local development convenience. Production deployment targets Vercel, Render, Neon Postgres, and Cloudinary.

## IntelliJ IDEA Run Configurations

Shared IntelliJ run configurations are stored in `.run/`.
They call shell scripts from `scripts/run/`; keep those scripts executable.

Recommended configs:

| Config | Purpose |
|---|---|
| `Docker Compose - Up` | Runs PostgreSQL, backend, and frontend together |
| `Docker Compose - Database Only` | Runs only PostgreSQL for local backend debugging |
| `Docker Compose - Down` | Stops the local Docker stack |
| `Full Stack - Verify` | Builds Docker services, runs frontend build, backend tests, and prints service status |
| `Backend - Spring Boot` | Runs backend locally with Maven against Docker PostgreSQL on `localhost:55432` |
| `Backend - Tests` | Runs backend Maven tests |
| `Frontend - Vite Dev` | Runs the Vite dev server from `frontend/` |
| `Frontend - Build` | Runs the frontend production build |

For the simplest workflow, start `Docker Compose - Up`, then open:

```text
http://localhost:5173
http://localhost:8080/swagger-ui.html
```

For backend debugging in IntelliJ, use this order:

```text
1. Docker Compose - Down
2. Docker Compose - Database Only
3. Backend - Spring Boot
```

Do not run `Backend - Spring Boot` while `Docker Compose - Up` is already running, because the Docker backend already uses port `8080`.

If IntelliJ shows `Cannot determine shell script parent directory`, reload the project from disk and confirm the selected configuration uses `Script path`, not inline script text. The shared configs should point to `$PROJECT_DIR$/scripts/run/*.sh`.

## Environment Variables

Backend variables are documented in `backend/.env.example`.
Frontend variables are documented in `frontend/.env.example`.

OpenAI is called only by the Spring Boot backend. The frontend must call backend endpoints such as `/api/submissions/{id}/explain`; it must never contain `OPENAI_API_KEY`.

Required OpenAI backend variables:

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Secret API key used only by the backend |
| `OPENAI_MODEL` | Model name, for example `gpt-5.4-mini` |
| `AI_TIMEOUT_SECONDS` | OpenAI request timeout |
| `AI_MAX_OUTPUT_TOKENS` | Output token cap for cost control |
| `AI_EXPLAIN_LIMIT_PER_USER` | Maximum successful explanation requests per user per day |

Never commit real `.env` files.

## API Documentation

When the backend is running, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui.html
```

Health checks:

```text
http://localhost:8080/healthz
```

See [docs/API.md](docs/API.md).

## GitHub Actions

The workflow in `.github/workflows/ci.yml` verifies the backend tests, frontend production build, and Render backend health endpoint.

For the Render check, configure this repository variable in GitHub:

```text
RENDER_BACKEND_URL=https://ai-study-assistant-backend-t7gs.onrender.com
```

Set it under **Settings > Secrets and variables > Actions > Variables**. A secret with the same name also works, but the value is only the public backend URL, not an API key.

## Database Schema Overview

Core tables:

- users
- roles
- subjects
- submissions
- ai_responses
- grading_results
- ai_usage_logs

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon Postgres
- Media storage: Cloudinary

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Security Notes

The backend enforces JWT, RBAC, and ownership checks. The frontend protects routes for UX only. Private API responses are not cached by the PWA service worker.

See [docs/SECURITY.md](docs/SECURITY.md).

## Future Improvements

- Async AI job queue.
- Per-minute rate limiting in addition to the daily explanation quota.
- More advanced admin analytics.
- Sentry monitoring.
- Additional AI providers.
- Capacitor wrapper if native app packaging is needed.
