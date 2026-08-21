# AGENTS.md — AI Entry Point

This repository is a dual-stack digital agency platform (Rovno.dev).

## Tech Stack
- **Frontend**: Next.js (App Router), React 19, Tailwind CSS v4, Amorfa UI.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0 (PostgreSQL), Valkey (Redis-compatible).
- **Infrastructure**: Docker Compose, Traefik (Proxy), GitHub Actions.

## Directory Map
- `website/`: Next.js application. Logic is in `app/`, reusable UI in `components/ui/`.
- `backend/services/main-service/`: FastAPI service. Follows `app/api/v1/`, `app/models/`, `app/schemas/`, and `app/services/` structure. Actual DB structure stores in `schema.dbml`.
- `.agents/skills/`: Custom AI workflows. Use these commands to maintain standards.

## Development Workflows
- **Code Style**: No boilerplate, logic over abstractions, functional components.
- **Backend Logic**: Use Pydantic schemas for validation and Service layer for business logic.
- **Frontend Style**: Reference `minimalist-ui` and `design-taste-frontend` skills for high-end aesthetic.

## Skill Invocation
Always check `.agents/skills/` before complex tasks. Key commands:
- `/code-review` — Review changes since merge-base.
- `/improve-codebase-architecture` — Search for deepening opportunities.
- `/diagnose-bugs` — Build feedback loops for hard regressions.