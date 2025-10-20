#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$ROOT_DIR/.tools:$PATH"
export UV_CACHE_DIR="$ROOT_DIR/.cache/uv"

exec "$ROOT_DIR/.tools/uvx" \
  --from git+https://github.com/oraios/serena \
  serena-mcp-server \
  --context ide-assistant \
  --project "$ROOT_DIR"
  --index