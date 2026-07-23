# Deployment

## Local Docker vs Cloud Deployment

Docker Compose is used for local development. Cloud deployment should use Vercel for frontend, Render for backend, Neon Postgres for database, and Cloudinary for media storage.

## Vercel Frontend

- Build command: `npm run build`
- Output directory: `dist`
- Required env var: `VITE_API_BASE_URL`
- Root directory: `frontend`
- Keep `frontend/vercel.json` so React Router routes such as `/dashboard` and `/submissions` rewrite to `index.html` when refreshed.
- Verify PWA manifest and service worker after deployment.
- Confirm the deployed frontend can call the configured HTTPS backend.

Production frontend API base URL examples:

```text
VITE_API_BASE_URL=https://api.ducanh.space/api
VITE_API_BASE_URL=https://ai-study-assistant-backend-t7gs.onrender.com/api
```

## Render Backend

- Root directory: `backend`
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/*.jar`
- Health check path: `/healthz`
- Required env vars: database, JWT, Cloudinary, AI provider, and CORS settings.
- Set `CORS_ALLOWED_ORIGINS` to the frontend origins, not the backend API origin.
- Set OpenAI variables only on the backend service: `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_TIMEOUT_SECONDS`, `AI_MAX_OUTPUT_TOKENS`, and `AI_EXPLAIN_LIMIT_PER_USER`.

## EC2 Backend With Nginx

- Run the Spring Boot backend container on port `8080`.
- Put Nginx in front of the container and proxy `https://api.ducanh.space` to `http://127.0.0.1:8080`.
- Use Certbot with Nginx so Vercel's HTTPS frontend can call the backend without mixed-content blocking.
- Keep port `8080` closed publicly after HTTPS works; expose only `80`, `443`, and restricted `22`.
- Set backend CORS to the frontend origins:

```text
CORS_ALLOWED_ORIGINS=https://ai-study-assistant-platform-nine.vercel.app,https://ducanh.space,https://www.ducanh.space,http://localhost:5173
```

`https://api.ducanh.space` is the backend origin. It is normally used in `VITE_API_BASE_URL`, not in `CORS_ALLOWED_ORIGINS`.

## GitHub Actions Deployment Check

The repository includes `.github/workflows/ci.yml`.

It runs:

- Backend Maven tests from `backend/`.
- Frontend Vite production build from `frontend/`.
- Render backend health check against `/healthz` after successful builds.

Configure the backend URL in GitHub:

```text
Settings > Secrets and variables > Actions > Variables
Name: RENDER_BACKEND_URL
Value: https://ai-study-assistant-backend-t7gs.onrender.com
```

You can also store it as an Actions secret with the same name. Do not store API keys in this variable. The workflow has a fallback to the current Render URL, but the repository variable is easier to maintain if the Render service URL changes later.

The Render health job runs on manual workflow dispatch and on pushes to `main`. Pull requests only run build checks, because they should not validate the production service.

## Neon PostgreSQL

- Create a Neon project and database.
- Use the pooled connection string when suitable.
- Configure backend database env vars on Render.
- Backend schema compatibility fixes run through Flyway migrations before JPA starts.
- Keep `JPA_DDL_AUTO=update` for the MVP unless switching fully to managed migrations later.

## Cloudinary

Required backend variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Uploads are validated by file type and size before sending to Cloudinary.

## Environment Variables

Never commit real values. Use platform secrets in Vercel and Render.

Frontend deployments should only receive `VITE_API_BASE_URL`. Do not set `OPENAI_API_KEY` on Vercel frontend projects.

## Common Issues

- CORS failures: verify `CORS_ALLOWED_ORIGINS`.
- Mixed-content failures: verify the frontend uses an HTTPS API base URL such as `https://api.ducanh.space/api`.
- Health check failures: verify Render is using `/healthz` and the service binds to the provided port.
- Database failures: verify Neon connection string and SSL settings.
- PWA install failures: verify HTTPS, manifest icons, and service worker registration.
- Upload failures: verify Cloudinary credentials and file size limits.
