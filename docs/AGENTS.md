# Global Agent Rules

Read `docs/SPEC.md` first. Then read the `AGENTS.md` for the service you are touching.

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
- When you change a public interface, update its `spec.md` in the same change. If a table changes, update the `.dbml` too. If a public interface changes, bump `docs/VERSION`.
- Extending is expected. Add auth, uploads, queues, whatever a feature needs — just keep each concern in its own module and update the spec.

## Testing is part of done

```bash
(cd backend/services/main-service && pytest -q)
(cd website && npx tsc --noEmit)
(cd tg-bot && pytest -q)
```
