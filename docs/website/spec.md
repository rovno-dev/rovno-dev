# website — Spec

Next.js app.

## Route map

| Path | Renders |
|------|---------|
| `/` | Home page (hero, services, projects, CTA) |
| `/projects` | Portfolio grid |
| `/projects/[slug]` | Case study |
| `/services` | Services list |
| `/services/[slug]` | Service details (MDX) |
| `/tech` | Tech stack SEO pages |
| `/events` | Upcoming events |
| `/events/[slug]` | Event landing (some are custom pages) |
| `/blog` | Articles list |
| `/blog/[slug]` | Article page |
| `/about` | Team and values |
| `/order` | Lead generation form |
| `/login`, `/register`, `/verify-email`, `/forgot-password` | Auth flows |
| `/app/profile/*` | User profile and article editor |
| `/admin/[secret]/*` | Admin panel |

## Data fetching

All API calls go through `$fetch` from `utils/fetch.ts`.
- Handles JWT injection.
- Handles 401 refresh token rotation automatically.
- Shows a `sonner` toast on error unless `isToast: false`.
- Returns `{ response, json }`.

## Design Tokens

Semantic CSS variables in `app/globals.css`. Never hardcode hex.

```text
--primary, --on-primary
--bg, --card, --outline
--on-bg-high, --on-bg-medium, --on-bg-low
--primary-glass, --state-hover
--error, --success, --warning
```

Tailwind reads them via `@theme inline`.

## Component primitives

`components/ui/` — extended from shadcn. **Compose**, never fork.

## Auth

JWT stored in cookies via `safe-cookie-storage.ts`.
- `access_token` (short lived)
- `refresh_token` (long lived)
Managed by `UserProvider` in `@/entities/user/model/user-context`.

## i18n

Translations live in `entities/i18n/`. Access via `useLanguage()` hook.
Supported: `en`, `ru`.
