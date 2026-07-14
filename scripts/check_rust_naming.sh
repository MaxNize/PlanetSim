#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

find "$ROOT_DIR/wasm/src" -type f -name '*.rs' | while read -r f; do
  base="$(basename "$f")"
  if ! echo "$base" | grep -E '^[a-z0-9_]+\.rs$' >/dev/null; then
    echo "Rust module file name must be snake_case: $f" >&2
    exit 1
  fi
done
