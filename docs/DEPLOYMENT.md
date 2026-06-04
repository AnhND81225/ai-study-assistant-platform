# Deployment

## Local Docker vs Cloud Deployment

Docker Compose is used for local development. Cloud deployment should use Vercel for frontend, Render for backend, Neon Postgres for database, and Cloudinary for media storage.

## Vercel Frontend

- Build command: `npm run build`
- Output directory: `dist`
- Required env var: `VITE_API_BASE_URL`
- Verify PWA manifest and service worker after deployment.
- Confirm the deployed frontend can call the Render backend.

## Render Backend

- Root directory: `backend`
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/*.jar`
- Health check path: `/healthz`
- Required env vars: database, JWT, Cloudinary, AI provider, and CORS settings.
- Set `CORS_ALLOWED_ORIGINS` to the Vercel frontend origin.
- Set OpenAI variables only on the backend service: `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_TIMEOUT_SECONDS`, `AI_MAX_OUTPUT_TOKENS`, and `AI_EXPLAIN_LIMIT_PER_USER`.

## Neon PostgreSQL

- Create a Neon project and database.
- Use the pooled connection string when suitable.
- Configure backend database env vars on Render.
- Use migration or seed strategy for roles and subjects.

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
- Health check failures: verify Render is using `/healthz` and the service binds to the provided port.
- Database failures: verify Neon connection string and SSL settings.
- PWA install failures: verify HTTPS, manifest icons, and service worker registration.
- Upload failures: verify Cloudinary credentials and file size limits.
