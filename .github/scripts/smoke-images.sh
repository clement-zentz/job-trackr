#!/usr/bin/env bash
# .github/scripts/smoke-images.sh

set -euo pipefail

# Run the images with their default production commands on an isolated network.
smoke_id="job-trackr-smoke-$$"
backend_name="${smoke_id}-backend"
frontend_name="${smoke_id}-frontend"

cleanup() {
  docker logs "$backend_name" || true
  docker logs "$frontend_name" || true
  docker rm -f "$frontend_name" "$backend_name" >/dev/null 2>&1 || true
  docker network rm "$smoke_id" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker network create "$smoke_id" >/dev/null
docker run -d --name "$backend_name" --network "$smoke_id" --network-alias backend \
  -e DJANGO_SECRET_KEY=smoke-test-only-not-a-production-secret \
  -e ALLOWED_HOSTS=backend \
  -e DATABASE_URL=postgres://unused:unused@127.0.0.1:5432/unused \
  -e EMAIL_HOST=localhost \
  -e EMAIL_HOST_USER=unused \
  -e EMAIL_HOST_PASSWORD=unused \
  -e DEFAULT_FROM_EMAIL=smoke@example.com \
  -e FRONTEND_URL=http://frontend \
  job-trackr-backend:test >/dev/null

docker run -d --name "$frontend_name" --network "$smoke_id" --network-alias frontend \
  job-trackr-frontend:test >/dev/null
docker exec "$frontend_name" nginx -t

# The public configuration endpoint does not need a database or SMTP connection.
# Check backend endpoints directly and frontend assets and SPA routes through nginx.
docker exec -i "$backend_name" python - < "$(dirname "${BASH_SOURCE[0]}")/smoke-images.py"
