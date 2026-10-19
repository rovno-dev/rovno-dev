# Rovno.dev

Full-cycle digital agency platform. Built on top of the [Amorfa](https://unidoka.com/amorfa) framework.

## Architecture

- **Backend**: FastAPI, PostgreSQL, Valkey (Redis-compatible)
- **Frontend**: Next.js (App Router), Tailwind CSS v4
- **Bot**: Aiogram 3 (Telegram)

## Documentation

The `docs/` folder is the source of truth.

- [`docs/SPEC.md`](docs/SPEC.md) - The rules and contract.
- [`docs/architecture.md`](docs/architecture.md) - How the services connect.
- [`docs/DEV.md`](docs/DEV.md) - Local development workflow.
- [`docs/TESTING.md`](docs/TESTING.md) - How to verify your work.
- [`CHANGELOG.md`](CHANGELOG.md) - Major updates and versions.

## Quick Start (Dev)

```bash
# 1. Start infrastructure (DB, Cache, API, Bot)
docker compose -f docker-compose.dev.yml up -d

# 2. Start the frontend on the host
cd website
npm install
npm run dev
```

- Website: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
