.PHONY: help setup dev build lint format test check-structure check-max-lines check-quality ci

.DEFAULT_GOAL := help

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@echo "  help             Show this help message"
	@echo "  setup            Install dependencies and build WASM bindings"
	@echo "  dev              Start the frontend development server"
	@echo "  build            Build frontend production assets and WASM module"
	@echo "  lint             Run ESLint, Clippy, Markdownlint, and line checks"
	@echo "  format           Format frontend files using Prettier"
	@echo "  test             Run Vitest, Cargo tests, doc checks, and project validation"
	@echo "  check-structure  Verify the mandatory project directory layout"
	@echo "  check-max-lines  Verify that source files do not exceed 200 lines"
	@echo "  check-quality    Run Fallow and cargo-udeps dependency audits"
	@echo "  ci               Run full local CI/CD pipeline checks"

NODE_VERSION := $(shell cat .nvmrc 2>/dev/null || echo "18")

setup:
	@echo "Building WASM bindings..."
	cd wasm && wasm-pack build
	@echo "Installing workspace dependencies..."
	npm install
	@echo "Rust toolchain should be installed separately. Run: rustup toolchain install --file .rust-toolchain.toml"

dev:
	@echo "Starting frontend dev server..."
	cd frontend && npm run dev

build:
	@echo "Building frontend and wasm"
	cd wasm && wasm-pack build
	cd frontend && npm run build

lint:
	@echo "Running linters"
	cd frontend && npm run lint
	cd wasm && cargo clippy --all-targets -- -D warnings
	./scripts/check_rust_naming.sh
	@echo "Checking max-lines compliance..."
	node scripts/check-max-lines.js --exceptions max-lines-exceptions.json
	@echo "Checking markdown linting..."
	npm run lint:md

format:
	cd frontend && npm run format

test:
	@echo "Running tests"
	cd wasm && wasm-pack build
	cd frontend && npx tsc --noEmit
	cd frontend && npm run test
	cd wasm && cargo test
	./scripts/check_rust_line_count.sh
	cd wasm && RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
	@echo "Checking directory structure..."
	@make check-structure
	@echo "Checking max-lines compliance..."
	@node scripts/check-max-lines.js --exceptions max-lines-exceptions.json


check-structure:
	@echo "Verifying project structure..."
	@test -d frontend/src && echo "✅ frontend/src exists" || (echo "❌ frontend/src missing" && exit 1)
	@test -d wasm/src && echo "✅ wasm/src exists" || (echo "❌ wasm/src missing" && exit 1)
	@test -d Docs && echo "✅ Docs exists" || (echo "❌ Docs missing" && exit 1)
	@test -f max-lines-exceptions.json && echo "✅ max-lines-exceptions.json exists" || (echo "❌ max-lines-exceptions.json missing" && exit 1)
	@test -f .editorconfig && echo "✅ .editorconfig exists" || (echo "❌ .editorconfig missing" && exit 1)
	@test -f Makefile && echo "✅ Makefile exists" || (echo "❌ Makefile missing" && exit 1)

check-max-lines:
	@echo "Checking max-lines compliance..."
	node scripts/check-max-lines.js --exceptions max-lines-exceptions.json

check-quality:
	@echo "Running code quality scans..."
	npm run check:quality

ci:
	@echo "=== Running local CI/CD verification ==="
	@echo "--- 1. Building WASM ---"
	cd wasm && wasm-pack build
	@echo "--- 2. Linting and Formatting checks ---"
	cd frontend && npm run lint
	cd frontend && npx prettier --check 'src/**/*.{ts,tsx,css}'
	cd frontend && npx stylelint 'src/**/*.css' || true
	npm run lint:md
	node scripts/check-max-lines.js --exceptions max-lines-exceptions.json
	@echo "--- 3. Rust Naming and Line count checks ---"
	./scripts/check_rust_naming.sh
	./scripts/check_rust_line_count.sh
	@echo "--- 4. TypeScript checks & Tests ---"
	cd frontend && npx tsc --noEmit
	cd frontend && npm run test
	@echo "--- 5. Rust Cargo checks & Tests ---"
	cd wasm && cargo clippy --all-targets -- -D warnings
	cd wasm && cargo test
	cd wasm && cargo test --doc
	cd wasm && RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
	@echo "--- 6. E2E Tests ---"
	npm run test:e2e
	@echo "=== ✅ Local CI/CD verification complete & successful! ==="
