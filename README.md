# Rovno.dev

This repository contains the source code for the Rovno.dev agency web application and its associated infrastructure. The project follows a self-contained architecture where deployment logic, proxy configuration, and application code coexist in a single repository.

## Project Structure

- **webapp**: The Next.js application built with Tailwind CSS v4 and Unideka UI.
- **backend**: Docker configuration for the Fake API service and its database.
- **docker-compose.yml**: The root orchestration file that coordinates Traefik and the sub-services.
- **Makefile**: The primary entry point for managing the local and production environments.

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js (for local webapp development)
- Access to modify your system hosts file

### 1. (optinoal) Configure Hosts

Add the following entries to your `/etc/hosts` (Linux/macOS) or `C:\Windows\System32\drivers\etc\hosts` (Windows) file to route local traffic through Traefik:

```text
127.0.0.1  localhost
127.0.0.1  fake-api.localhost
127.0.0.1  i.localhost
```

### 2. Environment Setup

Copy the example environment file and adjust it for development:

```bash
cp .env.example .env
```

By default, the `.env` is configured for development:
- `DOMAIN=localhost`
- `ENTRYPOINT=web` (Port 80)
- `TLS_ENABLED=false`

### 3. Launch Services

Use the Makefile to start the infrastructure:

```bash
docker compose up --build --force-recreate
```

The web application will be accessible at http://localhost.

## Infrastructure Details

### Traefik Proxy

Traefik handles routing and SSL termination. In production, it automatically provisions certificates via Let's Encrypt using the TLS challenge. The configuration is logic-driven based on environment variables, eliminating the need to manually edit YAML files between deployments.

### Next.js (Webapp)

The frontend is a Next.js application running in standalone mode for optimized Docker performance. It uses Tailwind CSS v4 for styling and follows high-performance standards.

## Deployment

Automated deployment is handled via GitHub Actions. On every push to the main branch, the runner connects to the production server, pulls the latest code, and executes the restart sequence.

### Production Environment Requirements

The production server must have a `.env` file with the following overrides:
- `ENTRYPOINT=websecure`
- `TLS_ENABLED=true`
- `CERT_RESOLVER=myresolver`
- `DOMAIN`: Should include the full Host rule for all production subdomains.