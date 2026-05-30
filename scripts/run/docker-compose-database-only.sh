#!/usr/bin/env zsh
set -euo pipefail

cd "$(dirname "$0")/../.."
docker compose up -d postgres
