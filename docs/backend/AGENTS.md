# Backend — Agent Rules

Service: `backend/services/main-service`. FastAPI + SQLAlchemy 2 + Alembic.

## Layout

```text
app/
  api/v1/    routers — one file per resource
  models/    SQLAlchemy models
  schemas/   Pydantic v2 request/response
  services/  business logic (email, notifications, etc)
config/      logging, rate limiter
database/    engine, session, cache
alembic/     migrations
```

## Rules

- New resource = `models/<x>.py` + `schemas/<x>.py` + `api/v1/<x>.py`.
  Register the router in `app/api/router.py`.
- Never edit an applied Alembic migration. Add a new one:
  `alembic revision --autogenerate -m "..."`.
- Errors: `HTTPException` for 4xx. `{"detail": "..."}` for all.
- Never log PII. Never write to another service's tables.
- Always use `slugify` from `app.shared.slugify` for URL-safe strings.
- Pydantic schemas are mandatory. Never accept raw dicts in endpoints.

## Testing

- Run: `pytest -q`.
- Mock outbound side effects (SMTP, Telegram, external APIs).
