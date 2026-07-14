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
- [x] AC 1.1: Rust tests run on all pull requests (against dev and main)
- [x] AC 1.2: TypeScript tests run on all pull requests (against dev and main)
- [x] AC 1.3: Tests also run on push to main branch
- [x] AC 1.4: Coverage reports generated and uploaded (target: >80% for critical paths)
- [x] AC 1.5: Test failures block PR merge and fail CI/CD pipeline

### Linting & Formatting
- [x] AC 2.1: ESLint (including max-lines, JSDoc) runs on pull requests and main push
- [x] AC 2.2: Prettier format checks run on pull requests and main push
- [x] AC 2.3: Clippy lints Rust code on pull requests and main push
- [x] AC 2.4: Linting/formatting failures block PR merge

### Build Checks
- [x] AC 3.1: Frontend builds without errors or warnings (on main push only)
- [x] AC 3.2: WASM compiles to .wasm + .js bindings (on main push only)
- [x] AC 3.3: Cargo builds in release mode (on main push only)
- [x] AC 3.4: Build artifacts uploaded for deployment (on main push only)

### Security
- [x] AC 4.1: Dependency scanning (cargo-audit, npm audit)
- [x] AC 4.2: No secrets detected in commits (CI)
- [x] AC 4.3: Security vulnerabilities fail the build
- [x] AC 4.4: Critical dependencies pinned (Cargo.lock, package-lock.json)

### CI/CD Platforms
- [x] AC 5.1: GitHub Actions used for CI/CD
- [x] AC 5.2: Workflows triggered on PR (to dev/main) and push (to main)
- [x] AC 5.3: Status checks required for PR merge (tests only, fast feedback)
- [x] AC 5.4: Full CI/CD runs on main push (tests + linting + build)
- [x] AC 5.5: Workflow logs visible and debuggable

### Performance Tracking
- [x] AC 6.1: Build time tracked (target: < 5 min for full suite)
- [x] AC 6.2: WASM bundle size tracked (warn if > 500KB)
- [ ] AC 6.3: Performance regressions detected (optional)

-

## 🔧 Technical Solution

### GitHub Actions Workflows

**`.github/workflows/test.yml`** (CI Pipeline: Runs on PR and push to main/develop)
```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop, feature/**]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: frontend/.nvmrc
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: cd frontend && npm ci
      - run: npm --prefix frontend run lint
      - run: cd frontend && npx prettier --check 'src/**/*.{ts,tsx,css}'
      - run: cd frontend && npx stylelint 'src/**/*.css' || true
      - run: npm run lint:md
      - run: node scripts/check-max-lines.js --exceptions max-lines-exceptions.json

  typescript-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: frontend/.nvmrc
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - run: cd frontend && npx tsc --noEmit
      - run: cd frontend && npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-coverage
          path: frontend/coverage/

  rust-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: wasm
      - run: cd wasm && cargo clippy --all-targets -- -D warnings
      - run: cd wasm && cargo test
      - run: cd wasm && cargo test --doc
      - run: cd wasm && RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
      - run: ./scripts/check_rust_line_count.sh
```

**`.github/workflows/release.yml`** (Release Pipeline: Runs after CI Pipeline success on main)
```yaml
name: Release (semantic)

on:
  workflow_run:
    workflows: [CI Pipeline]
    types: [completed]
    branches: [main]

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version-file: frontend/.nvmrc
          cache: npm
          cache-dependency-path: package-lock.json
      - run: npm ci
      - run: npx semantic-release --no-ci
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**`.github/workflows/deploy.yml`** (Deploy Pipeline: Runs on self-hosted runner after CI Pipeline success on main)
```yaml
name: Deploy via Self-Hosted Runner

on:
  workflow_run:
    workflows: [CI Pipeline]
    types: [completed]
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: self-hosted
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: frontend/.nvmrc
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: wasm
      - run: npm ci
      - run: cd frontend && npm ci
      - run: cd wasm && cargo build --release --target wasm32-unknown-unknown
      - run: npm run build
      - run: |
          # Custom check size and local deploy script
          echo "Deploying application..."
```

**`.github/workflows/security.yml`** (Security Audit: Runs on PR and push to main/develop)
```yaml
name: Security Scanning

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: frontend/.nvmrc
      - run: npm audit --audit-level=high
      - run: cd frontend && npm audit --audit-level=high

  cargo-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: rustsec/audit-check-action@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Local pre-commit hooks are disabled; all linting, formatting, secret scanning, and testing are validated automatically via CI workflows.

### Branch Protection Rules

**`.github/settings.json` (GitHub App configuration)**
```json
{
  "protection": {
    "dismiss_stale_reviews": true,
    "require_code_review_count": 1,
    "require_status_checks": true,
    "required_status_checks": ["Lint & Format Checks", "TypeScript Tests & Coverage", "Rust Physics Engine Tests"],
    "restrict_who_can_push_to_matching_branches": ["main"]
  }
}
```
-

## 🧪 Tests

- [x] Unit: Verify all test runners execute correctly locally
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

- [/] DOD-Global: All criteria met
- [x] Test workflow runs on PR (to dev/main) and reports status
- [x] Build workflow runs only on push to main
- [x] Security checks run on all PRs and main push
- [ ] Branch protection enforced: PR requires passing tests before merge
- [ ] Deployment pipeline triggers automatically on main push
- [x] Team aware of CI/CD workflow: PR for testing, merge to main for deployment

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-002
**Related**: SPEC-012 (Deployment)
