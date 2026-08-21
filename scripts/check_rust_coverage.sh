#!/usr/bin/env sh
# Enforces 100% line/function/region coverage for the pure physics engine
# (wasm/src/physics/). wasm/src/wasm/mod.rs is excluded: its Result::Err
# branches construct a JsValue via wasm_bindgen, which aborts the process
# (SIGABRT) under plain `cargo test` outside a wasm32 target, so those paths
# cannot be exercised by cargo-llvm-cov here.

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

cd "$ROOT_DIR/wasm"
cargo llvm-cov \
  --ignore-filename-regex 'wasm/mod\.rs$' \
  --fail-under-lines 100 \
  --fail-under-functions 100 \
  --fail-under-regions 100
