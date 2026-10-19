# Architecture

## Services

```mermaid
flowchart LR
  Browser[Browser] -->|HTTPS| Traefik[Traefik]
  Traefik -->|/api/v1, /docs| Api[main-service : FastAPI]
  Traefik -->|/*| Web[website : Next.js]
  
  Api --> DB[(PostgreSQL main-db)]
  Api --> Cache[(Valkey)]
  Api --> Cloud[Yandex Cloud / SMTP]
  
  Bot[tg-bot : aiogram] -->|long polling| TG[Telegram]
  Bot -->|SQLAlchemy| DB
```

## Boundaries

- **main-service** — owns `main_db`, runs Alembic migrations, handles all business logic.
- **website** — Next.js. Calls the API via `$fetch` or server-side fetch.
- **tg-bot** — long-polling bot. Talks directly to the DB for reads, calls the API for writes.

## Networks

- **Dev**: `main-network-dev`. Infra in Docker, frontend on host.
- **Prod**: `main-network`. Everything containerised behind Traefik.
