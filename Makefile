.PHONY: setup dev build lint format test check-structure check-max-lines

NODE_VERSION := $(shell cat .nvmrc 2>/dev/null || echo "18")

setup:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Rust toolchain should be installed separately. Run: rustup toolchain install --file .rust-toolchain.toml"

dev:
	@echo "Starting frontend dev server..."
	cd frontend && npm run dev

build:
	@echo "Building frontend and wasm"
	cd frontend && npm run build
	cd wasm && cargo build --release

lint:
	@echo "Running linters"
	cd frontend && npm run lint || true
	cd wasm && cargo clippy --all-targets -- -D warnings || true
	./scripts/check_rust_naming.sh || true
	@echo "Checking max-lines compliance..."
	node scripts/check-max-lines.js --exceptions max-lines-exceptions.json || true
	@echo "Checking markdown linting..."
	npm run lint:md || true

format:
	cd frontend && npm run format || true

test:
	@echo "Running tests"
	cd frontend && npx tsc --noEmit
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
