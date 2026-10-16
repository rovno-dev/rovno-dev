# Rovno.dev

Source code and infrastructure for the Rovno.dev agency platform. Deployment
logic, proxy configuration, and application code all live in this repository.

## Project Structure

- **website/** — Next.js (App Router) frontend. See `website/README.md`.
- **backend/** — FastAPI service, PostgreSQL, Valkey. See `backend/README.md`.
- **tg-bot/** — Telegram bot. See `tg-bot/README.md`.
- **docker-compose.yml** — prod orchestration (Traefik + every service).
- **docker-compose.dev.yml** — dev orchestration (backend + db + valkey +
  bot, no Traefik, no frontend container).

## Local Development

Two workflows share the same `.env` at the repo root.

### Dev — frontend on the host, infra in Docker

The frontend is **not** containerised in dev. `next dev` runs on your
machine for fast HMR; the API, DB, cache, and bot run in Docker.

**1. Start the infrastructure:**

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
```

This brings up:

- API:      http://localhost:8000         (Swagger: /docs)
- Postgres: localhost:5432
- Valkey:   localhost:6379
- Telegram bot (long polling, no port)

**2. Start the frontend:**

```bash
cd website
npm install
npm run dev
```

Then open http://localhost:3000.

The frontend reads its own `website/.env`. Copy the example once if you
haven't already:

```bash
cp website/.env.example website/.env    # if the file exists
```

For this workflow to work, `website/.env` must point at the host-published
API port:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL_INTERNAL=http://localhost:8000
NEXT_PUBLIC_ROOT_DOMAIN=
NEXT_PUBLIC_HTTP_PROTOCOL=http
```

Empty `NEXT_PUBLIC_ROOT_DOMAIN` keeps the router in path-mode on
`localhost`, so no subdomain plumbing is needed for local URLs.

Tear down the infrastructure:

```bash
docker compose -f docker-compose.dev.yml down
```

Add `-v` to also drop the dev database volume.

Dev and prod are isolated by docker network (`main-network-dev` vs
`main-network`) and by project name, so both stacks can run at once without
container-name or volume-name collisions.

### Production-parity (Traefik, built image)

Use this when you need to test the deploy path exactly as it runs on the
server. Everything runs in Docker, including the frontend.

```bash
cp .env.example .env
docker compose up -d --build
```

- Web app: http://localhost
- API docs: http://localhost/docs
- Health: http://localhost/health

### Hosts (prod-parity workflow only)

Add to `/etc/hosts` (Linux/macOS) or
`C:\Windows\System32\drivers\etc\hosts` (Windows):

```text
127.0.0.1  localhost
127.0.0.1  i.localhost
127.0.0.1  admin.localhost
127.0.0.1  app.localhost
```

### Cleanup (optional, destructive)

> ⚠️ Removes every container and volume on the machine.

```bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume rm $(docker volume ls -q)
```

### Type checking

```bash
./website/node_modules/.bin/tsc --noEmit -p website/tsconfig.json
```

## Infrastructure Details

### Traefik Proxy

Traefik handles routing and SSL termination in the prod-parity stack. In
production it provisions certificates automatically via Let's Encrypt using
the TLS challenge. Behaviour is driven entirely by environment variables
(`DOMAIN`, `ENTRYPOINT`, `TLS_ENABLED`, `CERT_RESOLVER`) — no YAML edits
between deployments.

Dev uses no proxy. Ports are published directly; the host-run frontend hits
the API at `http://localhost:8000`, and `ALLOWED_ORIGINS` is overridden in
`backend/docker-compose.dev.yml` to allow the dev origin.

### Next.js (website)

Standalone output for Docker. Tailwind CSS v4. In prod the `public/`
directory is mounted from the host rather than baked into the image (see
`website/Dockerfile` and `website/docker-compose.yml`) — smaller images, and
no rebuild when a static asset changes. In dev the frontend runs on the
host, so `public/` is served directly by `next dev` with no mount at all.

## Deployment

Automated deployment is handled by `.github/workflows/deploy.yml`. On every
push to `main`, the runner connects to the production server, pulls the
latest code, detects which services changed, rebuilds only those, and
reconciles the running containers.

### Production environment

The production server `.env` overrides:

- `ENTRYPOINT=websecure`
- `TLS_ENABLED=true`
- `CERT_RESOLVER=myresolver`
- `DOMAIN` should contain the full `Host` rule for every production subdomain.
