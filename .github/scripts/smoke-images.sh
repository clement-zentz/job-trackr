#!/usr/bin/env bash
# .github/scripts/smoke-images.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Run the images with their default production commands on an isolated network.
PROJECT="job-trackr-smoke-$$"
BACKEND_PYTHON=/app/.venv/bin/python

COMPOSE=(
  docker compose
  --project-name "${PROJECT}"
  -f "${REPO_ROOT}/compose.test-prod.yml"
)

cleanup() {
  local status=$?

  if ((status != 0)); then
    "${COMPOSE[@]}" logs --no-color backend frontend || true
  fi

  "${COMPOSE[@]}" down --volumes --remove-orphans || true
}

trap cleanup EXIT

# Build images unless they were already built by the caller.
if [[ "${SMOKE_SKIP_BUILD:-0}" != "1" ]]; then
  "${COMPOSE[@]}" build backend frontend
fi

# Start the services using the existing images.
"${COMPOSE[@]}" up -d --no-build --wait backend frontend

# Test the frontend nginx configuration.
"${COMPOSE[@]}" exec -T frontend nginx -t

# Test the backend Django configuration.
"${COMPOSE[@]}" exec -T backend "$BACKEND_PYTHON" - < "$SCRIPT_DIR/smoke-images.py"
