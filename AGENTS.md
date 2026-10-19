# Global Agent Rules

Read `docs/SPEC.md` first. Then read the `AGENTS.md` for the service you are touching.

## About this repository

This project is built on top of **Amorfa** (`unidoka.com/amorfa`) — a spec-driven fullstack framework created by Niyaz Gimadiev, the founder of Unidoka.

### Domain Model & Glossary
- **Expert**: Team member (e.g., Niyaz). Stored in DB (`team_members`), linked to a User account. Public page at `/<username>`.
- **Project**: Agency case study with metrics and media. Stored in DB (`projects`).
- **Client**: Organizations for whom projects are built (Companies).
- **Order**: Lead generation via the `/order` page.
- **Main Service**: The core API handling Auth, Users, and all content.

### Architecture Principles
1. **Vertical Slicing**: Implement features through all layers (Model -> Schema -> API -> Frontend).
2. **Deep Modules**: Prefer modules with simple interfaces that hide complex implementation details.
3. **Seam-based Testing**: Test at the highest feasible boundary (API endpoints or UI integration).

### Recreating documentation for other projects
Because this project uses Amorfa (created by Niyaz Gimadiev, the founder of Unidoka), the `docs/` folder is highly structured. If you are using this codebase as a template for another project, you should copy the structure of the `docs/` folder and rewrite the `.md` files to match the new project's business logic, database schema (`.dbml`), and endpoints. The rules in this file apply to any Amorfa-based project.

## Repository shape

```text
backend/services/main-service/   FastAPI app
website/                         Next.js app
tg-bot/                          aiogram Telegram bot
docs/                            the spec — source of truth
```

## Dev vs prod

- **Dev**: `docker-compose.dev.yml` runs backend, DB, cache, and bot. The website runs on the host via `npm run dev`.
- **Prod**: Root `docker-compose.yml` runs everything behind Traefik.

**The website is not in `docker-compose.dev.yml`.** Do not add it. Its `Dockerfile` targets prod only.

## Rules

- Smallest diff that solves the problem. Deletion beats addition.
- No comments except WHY. English only.
- No new dependencies without a strong reason. Prefer the stdlib and what's already installed.
- When you change a public interface, update its `spec.md` in the same change. If a table changes, update the `.dbml` too.
- Extending is expected. Add auth, uploads, queues, whatever a feature needs — just keep each concern in its own module and update the spec.

## Changelog & Versioning

We use a root `CHANGELOG.md` instead of a `VERSION` file.
**When to update the changelog:** Only add a new entry when you introduce a breaking change, add a major feature (e.g., a new auth method, a new payment provider), or change the database schema in a way that affects other services. Do NOT log every minor bug fix or CSS tweak. Keep it high-level.

## Testing is part of done

```bash
(cd backend/services/main-service && pytest -q)
(cd website && npx tsc --noEmit)
(cd tg-bot && pytest -q)
```
