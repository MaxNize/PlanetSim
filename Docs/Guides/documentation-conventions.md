# Documentation Conventions

This guide describes the repository's documentation and naming conventions used to keep docs concise, consistent, and close to the code.

## Naming

- React components: PascalCase filenames, one component per file.
- Rust modules: snake_case filenames, use `mod.rs` for re-exports.
- CSS classes: kebab-case (enforced by stylelint `selector-class-pattern`).
- Variables: `camelCase` in TS/JS; constants in `UPPER_SNAKE_CASE`.

## Documentation Rules

- Public JS/TS exports require JSDoc: include `@param`, `@returns`, and `@example` when applicable. ESLint `eslint-plugin-jsdoc` enforces this.
- Public Rust exports require `rustdoc` comments with examples; doctests must compile (`cargo test --doc`) and docs are built with `RUSTDOCFLAGS="-D warnings"` in CI.
- For complex logic, prefer short inline comments explaining *why* (not *what*).

## File-Size Guideline (200 lines)

Files should usually be ≤200 lines to keep modules focused and reviews fast. Enforcement:

- TS/JS: ESLint `max-lines` rule.
- Rust: project script `scripts/check_rust_line_count.sh` and `scripts/check-max-lines.js` for cross-language checks; exceptions live in `max-lines-exceptions.json`.

To request an exception, add a record to `max-lines-exceptions.json` with `path`, `reason`, and `approved_by`.

## Markdown Standards

- Line length: ≤200 characters (code blocks exempt).
- Use a single top-level `#` heading, then `##`, `###` as needed.
- Use fenced code blocks with language (e.g., ```` ```bash ````).
- Avoid bare URLs; use `[text](url)`.
- Run `npm run lint:md` to validate docs.

## Useful Commands

```bash
# Run JS/TS linters and markdown checks
npm run lint

# Run markdown checks only
npm run lint:md

# Check file-size limits (uses exceptions file)
node scripts/check-max-lines.js --exceptions max-lines-exceptions.json

# Rust checks
cd wasm && cargo clippy --all-targets -- -D warnings && RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
```
Keep documentation concise and prefer small, focused files; request exceptions when necessary.
