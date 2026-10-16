# Website — Next.js frontend

Next.js (App Router) + React 19 + Tailwind CSS v4. Standalone Docker output
for prod. Runs directly on the host in dev — no container.

## Layout

- `app/` — routes. Public pages at the top level; `(Subdomains)/admin/*` and
  `(Subdomains)/app/*` are the admin panel and user profile areas.
- `components/` — UI primitives (`ui/`), layout chrome (`layout/`), editors
  (`editor/`), MDX renderers (`mdx/`), icons (`icons/`).
- `entities/`, `providers/`, `hooks/`, `lib/`, `utils/` — cross-cutting logic.
- `public/` — static assets. Not baked into the prod image; mounted from the
  host by compose. Served directly by `next dev` in dev.

## Environment

The website reads its own `.env` at `website/.env`. Key variables:

- `NEXT_PUBLIC_ROOT_DOMAIN` — root domain for cross-subdomain routing. Leave
  empty on `localhost` for path-mode.
- `NEXT_PUBLIC_API_BASE_URL` — where the browser talks to the API.
  `http://localhost:8000` in dev, `https://rovno.dev` in prod.
- `API_BASE_URL_INTERNAL` — where server-side code (RSC, route handlers)
  talks to the API. In dev, same host-published port. In prod, uses the
  docker-network service name (`http://main-service:8000`).

Dev values that work with `docker-compose.dev.yml` at the repo root:

```text
NEXT_PUBLIC_ROOT_DOMAIN=
NEXT_PUBLIC_HTTP_PROTOCOL=http
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL_INTERNAL=http://localhost:8000
```

## Dev

No Docker. The frontend runs on the host; the API, DB, and cache run in
Docker (see `../docker-compose.dev.yml` and `../backend/README.md`).

**1. Start the backend stack** (once, from the repo root):

```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Install and run the frontend:**

```bash
cd website
npm install
npm run dev
```

Open http://localhost:3000.

Why host instead of container: `next dev` needs fast file watching and a
shared `node_modules` cache to be pleasant to work in. Docker's bind-mount
overhead on macOS/Windows makes HMR noticeably laggier for no benefit — the
frontend has no service dependencies beyond the API's port, which is already
published to the host.

## Prod

Built as a standalone image. `.next/standalone` + `.next/static` are baked
in; `public/` is mounted from the host by compose (see
`docker-compose.yml`) so the image stays small and static assets can be
swapped without a rebuild.

```bash
docker compose up -d --build
```

Traefik routes the configured `DOMAIN` to the container on port 3000.

## Type checking

```bash
npm install
npx tsc --noEmit -p tsconfig.json
```
