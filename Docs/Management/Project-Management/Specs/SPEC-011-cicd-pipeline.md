# SPEC-011: CI/CD Pipeline

-

## 📝 User Story
```text
As a maintainer
I want automated testing and quality checks on every push
so that regressions are caught early and code quality remains high
```
-

## ✅ Acceptance Criteria

### Test Automation
- [ ] AC 1.1: Rust tests run on all pull requests (against dev and main)
- [ ] AC 1.2: TypeScript tests run on all pull requests (against dev and main)
- [ ] AC 1.3: Tests also run on push to main branch
- [ ] AC 1.4: Coverage reports generated and uploaded (target: >80% for critical paths)
- [ ] AC 1.5: Test failures block PR merge and fail CI/CD pipeline

### Linting & Formatting
- [ ] AC 2.1: ESLint (including max-lines, JSDoc) runs on pull requests and main push
- [ ] AC 2.2: Prettier format checks run on pull requests and main push
- [ ] AC 2.3: Clippy lints Rust code on pull requests and main push
- [ ] AC 2.4: Linting/formatting failures block PR merge

### Build Checks
- [ ] AC 3.1: Frontend builds without errors or warnings (on main push only)
- [ ] AC 3.2: WASM compiles to .wasm + .js bindings (on main push only)
- [ ] AC 3.3: Cargo builds in release mode (on main push only)
- [ ] AC 3.4: Build artifacts uploaded for deployment (on main push only)

### Security
- [ ] AC 4.1: Dependency scanning (cargo-audit, npm audit)
 - [ ] AC 4.2: No secrets detected in commits (CI)
- [ ] AC 4.3: Security vulnerabilities fail the build
- [ ] AC 4.4: Critical dependencies pinned (Cargo.lock, package-lock.json)

### CI/CD Platforms
- [ ] AC 5.1: GitHub Actions used for CI/CD
- [ ] AC 5.2: Workflows triggered on PR (to dev/main) and push (to main)
- [ ] AC 5.3: Status checks required for PR merge (tests only, fast feedback)
- [ ] AC 5.4: Full CI/CD runs on main push (tests + linting + build)
- [ ] AC 5.5: Workflow logs visible and debuggable

### Performance Tracking
- [ ] AC 6.1: Build time tracked (target: < 5 min for full suite)
- [ ] AC 6.2: WASM bundle size tracked (warn if > 500KB)
- [ ] AC 6.3: Performance regressions detected (optional)

-

## 🔧 Technical Solution

### GitHub Actions Workflows

**`.github/workflows/test.yml`** (Runs on PR and push to main)
```yaml
name: Tests

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [main]

jobs:
  rust-tests:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: dtolnay/rust-toolchain@stable
 - run: cargo test --release
 - run: cargo clippy -- -D warnings

  typescript-tests:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
 - run: npm ci
 - run: npm test
 - run: npm run coverage
 - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  lint-and-format:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
 - run: npm ci
 - run: npm run lint
 - run: npm run format:check
 - run: cargo clippy -- -D warnings
```
**`.github/workflows/build.yml`** (Runs only on push to main)
```yaml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build-wasm:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: dtolnay/rust-toolchain@stable
 - uses: actions/setup-node@v4
        with:
          node-version: '20'
 - run: cargo build --release --target wasm32-unknown-unknown
 - run: npm ci && npm run build:wasm
 - uses: actions/upload-artifact@v3
        with:
          name: wasm-dist
          path: dist/

  bundle-size:
    runs-on: ubuntu-latest
    needs: build-wasm
    steps:
 - uses: actions/download-artifact@v3
        with:
          name: wasm-dist
 - run: du -h planet_sim_wasm_bg.wasm | grep -oP '\d+\.?\d*[KM]'
 - run: echo "Bundle size check: ensure < 500KB"
```
**`.github/workflows/security.yml`** (Runs on PR and push to main)
```yaml
name: Security

on:
  pull_request:
    branches: [dev, main]
  push:
    branches: [main]

jobs:
  cargo-audit:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: rustsec/audit-check-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

  npm-audit:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
 - run: npm audit --audit-level=moderate

  secrets-scan:
    runs-on: ubuntu-latest
    steps:
 - uses: actions/checkout@v4
 - uses: gitleaks/gitleaks-action@v2
```
Local pre-commit hooks have been removed from the standard project configuration; CI runs all required checks (linting, formatting, secret scanning, tests).
### Branch Protection Rules

**`.github/settings.json` (GitHub App configuration)**
```json
{
  "protection": {
    "dismiss_stale_reviews": true,
    "require_code_review_count": 1,
    "require_status_checks": true,
    "required_status_checks": ["test", "build-wasm", "lint-and-format"],
    "restrict_who_can_push_to_matching_branches": ["main"]
  }
}
```
-

## 🧪 Tests

- [ ] Unit: Verify all test runners execute correctly locally
- [ ] Integration: Push to PR → CI runs automatically
- [ ] Manual: Verify failed tests block PR merge

-

## 🚀 Implementation Flow

1. Spec Review
2. Set up GitHub Actions workflows (test.yml, build.yml, security.yml)
3. Configure trigger branches: PR against dev/main, push to main only
4. Ensure CI checks run secret detection and linting
5. Configure branch protection rules on main
6. Test: Open PR → tests run, push to main → full CI/CD runs
7. Verify deployment triggers correctly after main push

-

## ✅ Definition of Done

- [ ] DOD-Global: All criteria met
- [ ] Test workflow runs on PR (to dev/main) and reports status
- [ ] Build workflow runs only on push to main
- [ ] Security checks run on all PRs and main push
- [ ] Branch protection enforced: PR requires passing tests before merge
- [ ] Deployment pipeline triggers automatically on main push
- [ ] Team aware of CI/CD workflow: PR for testing, merge to main for deployment

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002
**Related**: SPEC-012 (Deployment)
