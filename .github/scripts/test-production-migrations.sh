#!/usr/bin/env bash
# .github/scripts/test-production-migrations.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PROJECT="job-trackr-migrations-$$"

COMPOSE=(
  docker compose
  --project-name "${PROJECT}"
  --profile migrations
  -f "${REPO_ROOT}/compose.test-prod.yml"
)

cleanup() {
  local status=$?

  if ((status != 0)); then
    "${COMPOSE[@]}" logs --no-color database || true
  fi

  "${COMPOSE[@]}" down --volumes --remove-orphans || true
}

trap cleanup EXIT

# Build the production backend image unless already built.
if [[ "${SMOKE_SKIP_BUILD:-0}" != "1" ]]; then
  "${COMPOSE[@]}" build backend
fi

# Start PostgreSQL and wait for its health check.
"${COMPOSE[@]}" up -d --no-build --wait database

# Execute all migration checks in one temporary backend container.
"${COMPOSE[@]}" run --rm -T --no-deps backend sh -eu -c '
  echo "1/3: Apply migrations"
  python job_trackr/manage.py migrate --noinput

  echo "2/3: Verify no migrations remain pending"
  python job_trackr/manage.py migrate --check

  echo "3/3: Verify repeated execution"
  python job_trackr/manage.py migrate --noinput
'

echo "Production migration smoke test passed."
