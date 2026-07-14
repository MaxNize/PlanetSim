#!/usr/bin/env sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
MAX_LINES=200

EXCEPTIONS="
$ROOT_DIR/wasm/src/lib.rs
$ROOT_DIR/wasm/src/physics/mod.rs
$ROOT_DIR/wasm/src/physics/calculations.rs
$ROOT_DIR/wasm/src/physics/gravity.rs
$ROOT_DIR/wasm/src/wasm/mod.rs
"

find "$ROOT_DIR/wasm" -type f -name '*.rs' | while read -r file; do
  if printf '%s' "$EXCEPTIONS" | grep -Fxq "$file"; then
    continue
  fi

  line_count="$(wc -l < "$file" | tr -d ' ')"
  if [ "$line_count" -gt "$MAX_LINES" ]; then
    printf 'Rust file too long: %s (%s lines, max %s)\n' "$file" "$line_count" "$MAX_LINES" >&2
    exit 1
  fi
done
