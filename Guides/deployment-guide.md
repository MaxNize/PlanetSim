# Deployment Guide

This document outlines the deployment architecture and configuration for running the planet simulation
application containerized behind Nginx Proxy Manager (NPM) on a private home server using a self-hosted GitHub Actions runner.

---

## 🏗️ Architecture Overview

```text
┌──────────┐            ┌───────────┐      Port Forward      ┌─────────────┐
│  Client  ├────────────────────→│  DynDNS   ├───────────────────────→│ Home Router │
└──────────┘  (IPv6->IPv4 CDN)   └───────────┘      (Ports 80/443)    └──────┬──────┘
                                                                             │
                                                                             ▼
┌──────────────────────────────── Server ────────────────────────────────────┼┐
│                                                                            ││
│  ┌──────────────────────┐    Reverse Proxy    ┌──────────────────────┐     ││
│  │ planet-simulation    │←────────────────────┤ Nginx Proxy Manager  │←────┘│
│  │ Container (Port 80)  │  Shared Network     │ Container (Port 443) │      │
│  └──────────────────────┘                     └──────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Prerequisites

Before executing the deployment workflow, ensure the following are configured on the target server:

1. **Docker & Docker Compose**: Installed and running on the host system.
2. **GitHub Self-Hosted Runner**:
   - Register a runner in your repository under **Settings ➔ Actions ➔ Runners**.
   - Start the runner as a background service. Ensure the runner user has permissions to run docker commands (added to the `docker` group).
3. **Shared Docker Network**:
   - Create a shared external Docker network so NPM can communicate with the application container:
     ```bash
     docker network create npm_network
     ```

---

## 🔒 Configuration

### 1. GitHub Secrets

Define the following repository secrets under **Settings ➔ Secrets and variables ➔ Actions**:

- `NPM_NETWORK_NAME`: The name of the shared docker network created above (e.g., `npm_network`).
- `APP_PORT`: The host port to bind the application container to (e.g., `8082`).

### 2. Nginx Proxy Manager (NPM) Setup

1. Open your NPM admin interface.
2. Go to **Hosts ➔ Proxy Hosts ➔ Add Proxy Host**.
3. Configure the following options:
   - **Domain Names**: Enter your DynDNS domain (e.g., ``).
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `planet-simulation` (matches compose container name).
   - **Forward Port**: `80`
   - **Websockets Support**: Enabled.
   - **Block Common Exploits**: Enabled.
4. In the **SSL** tab:
   - Request a new SSL Certificate from **Let's Encrypt**.
   - Force SSL to enable HTTPS.

### 3. DynDNS Configuration ()

- Configure your home router to update your  prefix on IP change.
- If using IPv6-only WAN, configure the IPv6-to-IPv4 mapping proxy on  to route IPv4 client requests.
