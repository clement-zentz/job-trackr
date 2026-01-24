#!/bin/sh
# backend/docker/job-trackr/entrypoint.sh

set -e

PY="/app/.venv/bin/python"

echo "Waiting for PostgreSQL to start..."
until nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  sleep 1
done

echo "PostgreSQL is up!"

cd /app/job_trackr
$PY manage.py migrate
$PY manage.py runserver 0.0.0.0:8000 --noreload
