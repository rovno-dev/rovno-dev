# Dev workflow

Three services. Three run in Docker, one runs on the host.

| Service        | Where     | How                              |
|----------------|-----------|----------------------------------|
| main-service   | Docker    | `docker compose -f docker-compose.dev.yml up -d` |
| tg-bot         | Docker    | `docker compose -f docker-compose.dev.yml up -d` |
| website        | **Host**  | `cd website && npm run dev`      |

## One-shot

```bash
docker compose -f docker-compose.dev.yml up -d
cd website && npm install && npm run dev
```

Ports:
- API:      http://localhost:8000
- Swagger:  http://localhost:8000/docs
- Postgres: localhost:5432
- Website:  http://localhost:3000

## Why website is not in Docker on dev

`next dev` on the host has instant HMR. Proxying file watching, the HMR websocket, and TLS through a container boundary adds latency and edge cases for no benefit.

## Database

- Dev DB is a separate volume: `main_db_dev_data`.
- Reset it:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```
