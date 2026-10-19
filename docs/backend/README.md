# main-service

FastAPI service for Rovno.dev. Handles Auth, Orders, Projects, Articles, Events, and Admin.

## Run

```bash
docker compose -f docker-compose.dev.yml up -d main-service
```

Swagger: http://localhost:8000/docs. Health: `/health`.

## See also

- `spec.md` — endpoints, env vars
- `schema.dbml` — DB schema
- `AGENTS.md` — conventions
