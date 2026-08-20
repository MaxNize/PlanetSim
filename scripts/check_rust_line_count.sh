#!/usr/bin/env sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
node "$ROOT_DIR/scripts/check-max-lines.js" --exceptions "$ROOT_DIR/max-lines-exceptions.json"
