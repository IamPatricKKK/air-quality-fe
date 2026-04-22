#!/usr/bin/env bash
# Start air-quality-fe (Vite :5173)
# Usage: bash run.sh [--no-install]
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

SKIP_INSTALL=false
for arg in "$@"; do
  case "$arg" in
    --no-install) SKIP_INSTALL=true ;;
  esac
done

if [ ! -f .env ]; then
  echo "⚠️  .env chưa có — copy từ .env.example"
  cp .env.example .env
fi

if [ "$SKIP_INSTALL" = false ]; then
  echo ">>> yarn install..."
  yarn install
fi

echo ">>> Starting Vite (FE) on :5173..."
exec yarn dev --port 5173
