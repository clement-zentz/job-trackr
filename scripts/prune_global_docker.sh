#!/usr/bin/env bash
# scripts/prune_global_docker.sh

set -euo pipefail

echo "WARNING: This removes unused Docker resources globally, not only this project."
echo "It may delete images, build cache, stopped containers, networks, anonymous volumes, and unused named volumes."
echo

printf "Type 'yes' to continue: "
read -r answer;

if [[ "$answer" != "yes" ]]; then
  echo "Aborted.";
  exit 0
fi

docker system prune -af --volumes
docker volume prune -af
docker builder prune -af
docker system df -v

# Execute this script:
# --------------------
# chmod 740 scripts/prune_global_docker.sh
# ./scripts/prune_global_docker.sh
