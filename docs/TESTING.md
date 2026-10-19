# Testing

Every change is verified by these commands. Run them before declaring done.

## The commands

```bash
# Backend (pytest)
(cd backend/services/main-service && pytest -q)

# Frontend (Typecheck + Playwright E2E)
(cd website && npx tsc --noEmit)
(cd website && npx playwright test)

# Telegram Bot (pytest)
(cd tg-bot && pytest -q)
```

## Rules

- A change without a test is incomplete work.
- Every endpoint -> at least one backend test.
- Every user flow -> Playwright E2E spec.
- Bug fixes start with a failing test.
- Mock network calls and Telegram API. Never hit real external services in unit tests.
