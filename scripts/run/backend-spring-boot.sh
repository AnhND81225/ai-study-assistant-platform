#!/usr/bin/env zsh
set -euo pipefail

cd "$(dirname "$0")/../.."
cd backend

DATABASE_URL="${DATABASE_URL:-jdbc:postgresql://localhost:${COMPOSE_POSTGRES_PORT:-55433}/eduaidb}" \
DATABASE_USERNAME="${DATABASE_USERNAME:-eduaidb_user}" \
DATABASE_PASSWORD="${DATABASE_PASSWORD:-change_me}" \
JWT_SECRET="${JWT_SECRET:-change_this_to_a_long_random_secret_at_least_32_characters}" \
CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-http://localhost:5173}" \
mvn spring-boot:run
