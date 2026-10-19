# main-service — Spec

Source of truth for the backend.

## DB schema

See [`schema.dbml`](../../backend/services/main-service/schema.dbml). Authoritative.

## Endpoints

Base: `/api/v1`. All JSON.

### Auth & User
- `POST /register/email` - Register with email + password.
- `POST /verify-email` - Verify OTP sent to email.
- `POST /login/email` - Login (returns JWT + refresh).
- `POST /refresh` - Refresh access token.
- `POST /forgot-password` - Send reset code.
- `POST /reset-password` - Reset password with code.
- `POST /2fa/setup` - Generate TOTP secret.
- `POST /2fa/enable` - Verify TOTP and enable 2FA.
- `GET /me` - Get current user profile.
- `PATCH /me` - Update current user profile.
- `GET /me/sessions` - List active sessions.

### Content (Public)
- `GET /projects` - List published projects.
- `GET /projects/{slug}` - Get single project.
- `GET /articles` - List published articles.
- `GET /articles/{slug}` - Get single article.
- `GET /events` - List published events.
- `GET /events/{slug}` - Get single event.
- `GET /companies` - List companies.
- `GET /team` - List team members.
- `GET /services` - Services data (from frontend MDX currently).

### Admin & CRM
- `GET /admin/dashboard` - Stats for admin panel.
- `GET /admin/users` - List users.
- `POST /admin/articles` - Create article.
- `POST /admin/articles/import-zip` - Bulk import articles from ZIP.
- `POST /admin/articles/bulk/approve` - Bulk approve articles.
- `GET /admin/order-requests` - List orders.
- `PATCH /admin/order-requests/{id}` - Update order status.
- `POST /orders/create` - Public endpoint to submit a new order.
- `POST /uploads/images` - Upload image.
- `POST /uploads/media` - Upload image or video (converts to webm).

## Env vars

| Var               | Required | Purpose                                |
|-------------------|----------|----------------------------------------|
| `MAIN_DB_*`       | yes      | Postgres connection                    |
| `CACHE_*`         | yes      | Valkey/Redis connection                |
| `JWT_SECRET_KEY`  | yes      | JWT signing key                        |
| `MAIL_SENDER`     | yes      | SMTP sender email                      |
| `TELEGRAM_BOT_TOKEN`| yes    | Telegram bot token                     |
| `ALLOWED_ORIGINS` | no       | Comma-separated CORS origins           |
