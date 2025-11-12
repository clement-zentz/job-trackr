#!/usr/bin/env bash
# scripts/add_spdx_header.sh

set -euo pipefail

SPDX_LINE="# SPDX-License-Identifier: AGPL-3.0-or-later"

for file in "$@"; do
  # Vérifie si le fichier contient déjà la ligne SPDX
  if ! grep -q "$SPDX_LINE" "$file"; then
    echo "Adding SPDX header to $file"
    # Si le fichier commence par un shebang (#!), insérer après
    if head -n 1 "$file" | grep -q '^#!'; then
      (head -n 1 "$file"; echo "$SPDX_LINE"; tail -n +2 "$file") > "$file.tmp" && mv "$file.tmp" "$file"
    else
      (echo "$SPDX_LINE"; cat "$file") > "$file.tmp" && mv "$file.tmp" "$file"
    fi
  fi
done