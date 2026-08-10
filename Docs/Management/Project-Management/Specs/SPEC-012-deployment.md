# SPEC-012: Deployment Strategy

-

## 📝 User Story
```text
As a developer/maintainer
I want the planet simulation application container and its documentation to deploy automatically
so that users always access the latest stable version and maintainers have clear setup guides
```
-

## ✅ Acceptance Criteria

### Application Containerization
- [x] AC 1.1: Web app built and packaged inside a lightweight Alpine Nginx Docker image
- [x] AC 1.2: Port mapping (`APP_PORT`) and external docker network (`NPM_NETWORK_NAME`) configurable via environment variables
- [x] AC 1.3: Support for single-page application (SPA) routing redirects in Nginx conf

### Automated CI/CD Deployment
- [x] AC 2.1: Automatic deployment triggered upon successful `CI Pipeline` workflow run on `main` branch
- [x] AC 2.2: Build and deploy execution runs on a `self-hosted` GitHub Actions runner
- [x] AC 2.3: Automatically stops and rebuilds the container using Docker Compose

### DNS & Reverse Proxy Integration
- [x] AC 3.1: Server exposed publicly using DynDNS / CDN (ipv64.net) mapping
- [x] AC 3.2: Reverse proxy routes traffic to the container using Nginx Proxy Manager (NPM) on the shared external network
- [x] AC 3.3: Let's Encrypt SSL certificates managed by Nginx Proxy Manager

### Documentation Validation & Publishing
- [x] AC 4.1: Documentation published to GitHub Pages (docs site)
- [x] AC 4.2: Auto-deploy on push to `main` branch for changes under `Docs/**`
- [x] AC 4.3: Documentation links validated via link checkers in CI/CD pipeline

-

## 🔧 Technical Solution

### Container Configurations

#### docker-compose.yml
Deploys the service attached to the external Nginx Proxy Manager network:
```yaml
services:
  planet-simulation:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: planet-simulation
    ports:
      - "${APP_PORT:-8080}:80"
    restart: unless-stopped
    networks:
      - npm_network

networks:
  npm_network:
    name: ${NPM_NETWORK_NAME:-bridge}
    external: true
```

### GitHub Actions Workflows

#### Application Deployment (`.github/workflows/deploy.yml`)
Triggers on `workflow_run` of the `CI Pipeline`:
1. Checkout repository.
2. Build WASM target and compile frontend production bundle.
3. Deploy application via `docker compose down && docker compose up -d --build`.

#### Documentation Deployment (`.github/workflows/deploy-docs.yml`)
Triggers on push to `main` for `Docs/**` changes:
```yaml
name: Deploy Documentation
on:
  push:
    branches: [main]
    paths: ['Docs/**', '.github/workflows/deploy-docs.yml']
permissions:
  contents: write
jobs:
  deploy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./Docs
```

-

## 🧪 Tests

- [x] Build: Docker image builds successfully and fits within standard sizes
- [x] Routing: Accessing virtual paths redirects to `index.html` (SPA routing)
- [x] E2E Deployment: Verifying that push to `main` starts container on runner
- [x] Link check: Link validation action verifies markdown links
- [x] Pages: Documentation compiles and deploys to GitHub Pages branch

-

## ✅ Definition of Done

- [x] DOD-Global: All criteria met
- [x] Dockerfile and docker-compose.yml operational
- [x] GitHub deployment workflows configured (Application and Documentation)
- [x] Shared NPM external network config functional
- [x] Deployment guide documented

-

## 📚 Related Specs

**Depends on**: SPEC-001, SPEC-011
**Required by**: Production accessibility
