#!/usr/bin/env zsh
set -euo pipefail

cd "$(dirname "$0")/../.."
docker compose up -d --build
docker compose exec -T frontend npm run build
(cd backend && mvn test)
docker compose ps
