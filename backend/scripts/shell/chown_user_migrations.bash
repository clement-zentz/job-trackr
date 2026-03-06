#!/usr/bin/env bash
# backend/scripts/shell/chown_user_migrations.bash

# How to execute this script from the root directory:

# sudo chmod 740 backend/scripts/shell/chown_user_migrations.bash
# ./backend/scripts/shell/chown_user_migrations.bash

set -euo pipefail

BACKEND_DIR="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
APPS_DIR="$BACKEND_DIR/job_trackr/apps"

echo "BACKEND_DIR=$BACKEND_DIR"

echo "📋 Before"
find "$APPS_DIR" -type f -path "*/migrations/*.py" \
  -exec stat -c "%U:%G %n" {} +

echo
echo "🔧 Running chown..."
# Find recursively all sub-directories of APPS_DIR,
# Then execute chown once for all migrations files.
find "$APPS_DIR" -type f -path "*/migrations/*.py" \
  -exec sudo chown "$USER:$USER" {} +

echo
echo "📋 AFTER:"
find "$APPS_DIR" -type f -path "*/migrations/*.py" \
  -exec stat -c "%U:%G %n" {} +

echo "✅ $USER now owns all migration files."
