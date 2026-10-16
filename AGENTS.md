# AGENTS.md — AI Entry Point

This repository is a dual-stack digital agency platform (Rovno.dev).

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4, Amorfa UI.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0 (PostgreSQL), Valkey
  (Redis-compatible).
- **Infrastructure**: Docker Compose, Traefik (prod only), GitHub Actions.

## File Structure

```text
rovno-dev/
├── .agents/skills/                Custom AI workflows (invoked as /commands)
├── .github/workflows/deploy.yml   Prod deploy on push to main
├── backend/
│   ├── docker-compose.yml         Prod: API + DB + cache + Traefik labels
│   ├── docker-compose.dev.yml     Dev: same services, published ports
│   └── services/main-service/
│       ├── alembic/               DB migrations
│       │   ├── versions/          One file per migration (chronological)
│       │   ├── env.py             Alembic runtime config
│       │   └── script.py.mako     Migration template
│       ├── app/
│       │   ├── api/v1/            Route handlers, one module per domain
│       │   │                      (auth, me, orders, projects, events,
│       │   │                       articles, team, tags, stack, companies,
│       │   │                       categories, mentions, notifications,
│       │   │                       bot, uploads, admin_*)
│       │   ├── models/            SQLAlchemy ORM models (one per table)
│       │   ├── schemas/           Pydantic request/response models
│       │   │                      (auth/, user/, project/, article/,
│       │   │                       event/, team/)
│       │   ├── services/          Business logic (email, notifications,
│       │   │                       otp, tags, stack, taxonomy, team, user)
│       │   └── shared/            Cross-cutting helpers (auth, slugify)
│       ├── config/                Logging + rate limiter
│       ├── database/              Engine, session, cache client
│       ├── main.py                FastAPI entry point
│       ├── requirements.txt
│       └── schema.dbml            Canonical DB schema reference
├── tg-bot/
│   ├── app/bot.py                 The whole bot (filters, FSM, handlers)
│   ├── docker-compose.yml         Prod
│   ├── docker-compose.dev.yml     Dev
│   ├── Dockerfile
│   └── requirements.txt
├── website/
│   ├── app/                       Next.js App Router
│   │   ├── (Subdomains)/          Route groups: admin/* and app/*
│   │   ├── _components/           Home page sections
│   │   ├── _data/                 Static content: MDX projects, services,
│   │   │                           legal docs, experts, clients, categories
│   │   ├── api/                   Route handlers (admin-secret, revalidate)
│   │   ├── [slug]/                Expert profile page
│   │   ├── projects/[slug]/       Case studies (shared + bespoke templates)
│   │   ├── events/[slug]/         Event pages (shared + bespoke templates)
│   │   ├── blog/[slug]/           Blog articles
│   │   ├── order/                 Order form
│   │   ├── docs/[slug]/           Legal documents
│   │   ├── services/[slug]/       Service detail pages
│   │   └── ...                    about, companies, login, register, etc.
│   ├── components/
│   │   ├── ui/                    shadcn-style primitives (Button, Card, …)
│   │   ├── layout/                Header, footer, sidebar, nav, TOC, logo
│   │   ├── editor/                Article / project / event editors
│   │   ├── icons/                 SVG icon components (logos, UI icons)
│   │   └── mdx/                   MDX renderers (Gallery, MetricCard, …)
│   ├── entities/
│   │   ├── i18n/                  Translation dictionaries (en / ru)
│   │   └── user/                  User context, api/fetch-me, guards
│   ├── hooks/
│   ├── lib/
│   ├── providers/                 Theme + language providers
│   ├── public/                    Static assets (mounted from host in prod)
│   ├── utils/
│   │   ├── api/                   Typed API clients, one file per domain
│   │   ├── constants/             Route constants
│   │   └── ...                    fetch, slugify, revalidate, helpers
│   ├── Dockerfile                 Prod build (standalone output)
│   ├── docker-compose.yml         Prod only — no dev compose
│   └── package.json
├── docker-compose.yml             Prod stack (Traefik + all services)
├── docker-compose.dev.yml         Dev stack (infra only, no frontend)
├── AGENTS.md
├── README.md
└── .env.example
```

## Docker Compose — Prod vs Dev

Two parallel stacks. Dev uses its own network (`main-network-dev`), its own
project name, and its own named volumes; it never touches prod containers
or volumes.

### Prod — everything in Docker, Traefik fronts it

```bash
docker compose up -d --build
```

### Dev — infrastructure in Docker, frontend on the host

```bash
docker compose -f docker-compose.dev.yml up -d      # db + valkey + api + bot
cd website && npm run dev                            # frontend on the host
```

**The frontend is intentionally not containerised in dev.** `next dev` on
the host gives the fastest HMR; the API and DB are reachable at
`localhost:8000` and `localhost:5432` because their dev compose files
publish those ports. There is no `website/docker-compose.dev.yml` — do not
create one.

Per-service dev files that do exist:

- `backend/docker-compose.dev.yml` — main-service (uvicorn `--reload`),
  main-db, valkey.
- `tg-bot/docker-compose.dev.yml` — tg-bot, sharing the dev network with
  the backend.

Conventions when editing a dev compose:

- **Networks:** `main-network-dev`, not `main-network`.
- **Container names:** `*-dev` suffix (`main-service-dev`, `main-db-dev`,
  `valkey-dev`, `tg-bot-dev`).
- **Ports published to host** so the host-run frontend can reach the API
  without proxy indirection.
- **Bind mounts** for source (`:cached` on macOS) plus anonymous volumes
  for build artifacts.

## Image Optimisation Notes

- **`public/` is never baked into the Next.js image.** The Dockerfile
  intentionally does not `COPY` it, and `website/.dockerignore` excludes it
  from the build context. `website/docker-compose.yml` mounts the host's
  `./public` into `/app/public`. This keeps the image small and lets static
  assets change without a rebuild. (In dev, `next dev` on the host serves
  `public/` directly — no mount involved.)
- Each service ships a `.dockerignore`
  (`backend/services/main-service/`, `tg-bot/`, `website/`) that excludes
  caches, `.env`, storage directories, and static assets.

## Development Workflows

- **Code Style**: No boilerplate, logic over abstractions, functional
  components.
- **Backend Logic**: Use Pydantic schemas for validation and a service
  layer for business logic.
- **Frontend Style**: Reference `minimalist-ui` and `design-taste-frontend`
  skills for high-end aesthetic.

## Skill Invocation

Always check `.agents/skills/` before complex tasks. Key commands:

- `/code-review` — Review changes since merge-base.
- `/improve-codebase-architecture` — Search for deepening opportunities.
- `/diagnose-bugs` — Build feedback loops for hard regressions.

## Documentation

- `README.md` — repo entry point, both workflows.
- `backend/README.md` — backend service, both workflows.
- `website/README.md` — frontend, both workflows.
- `tg-bot/README.md` — bot, both workflows.
