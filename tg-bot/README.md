# tg-bot — Rovno.dev Telegram bot

Aiogram bot that handles two jobs:

1. **Deep-link account binding.** `/start <code>` posts the chat id to the
   main service so a user can receive order notifications via Telegram.
2. **Admin tooling.** Search orders by ID / name / phone / email, dump
   recent orders to Excel.

Order notification *delivery* happens server-side in the main service
(`notification_service.py`) using the same bot token — the bot itself does
not need to run for notifications to go out.

## Layout

- `app/bot.py` — the whole bot: filters, FSM, handlers, entry point.
- `Dockerfile` — Python 3.11-slim, `python app/bot.py` as the entry point.
- `docker-compose.yml` — prod stack.
- `docker-compose.dev.yml` — dev stack.

## Environment

Reads from the root `.env`. Variables it cares about:

- `TELEGRAM_BOT_TOKEN` — from BotFather.
- `TELEGRAM_BOT_ALLOWED_USERS` — comma-separated Telegram user IDs that get
  the admin panel. Everyone else can still `/start <code>` to link their
  account.
- `TELEGRAM_BOT_WEBHOOK_SECRET` — shared secret between this process and
  `main-service`. The bot sends it as `X-Bot-Secret` on every call.
- `MAIN_DB_*` — direct DB access for the admin search / Excel export.

## Dev

```bash
docker compose -f docker-compose.dev.yml up -d
```

Shares the dev docker network (`main-network-dev`) with the backend so
`MAIN_SERVICE_URL=http://main-service:8000` resolves correctly. Storage is
bind-mounted from the backend's host dir so the Excel export can attach
order-file images without a second copy. The frontend is not part of this
stack — run it separately with `npm run dev` (see `../website/README.md`).

Logs:

```bash
docker compose -f docker-compose.dev.yml logs -f tg-bot
```

## Prod

```bash
docker compose up -d tg-bot
```

Traefik does not front the bot — it uses long polling against Telegram
directly, so no inbound routing is needed.
