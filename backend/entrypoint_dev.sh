#!/bin/sh
# backend/entrypoint_dev.sh

set -e

cd /app/job_trackr

python manage.py migrate
exec python manage.py runserver 0.0.0.0:8000
