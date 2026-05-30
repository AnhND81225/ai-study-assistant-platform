#!/usr/bin/env zsh
set -euo pipefail

cd "$(dirname "$0")/../.."
cd frontend
npm run build
