# tg-bot — Agent Rules

Service: `tg-bot`. aiogram 3, long polling.

## Rules

- Everything stays in `app/bot.py` until it grows past ~500 lines, then split.
- Handlers registered via decorators (`@dp.message(...)`).
- No global mutable state. If a flow needs steps, use FSM (`aiogram.fsm.state.State`).
- Escape user-controlled text before sending to Telegram.
- Do not log chat ids, usernames, or message contents above `DEBUG`.
- Read DB via SQLAlchemy (`select()`). Write to DB by calling the `main-service` API, not directly.
