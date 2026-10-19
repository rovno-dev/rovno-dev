# Website — Agent Rules

Service: `website`. Next.js 16 App Router + React 19 + Tailwind v4 + Radix.

## Layout

```text
app/                   routes (App Router)
  (Subdomains)/        admin and app routes
  _components/         home page sections
  _data/               static content (projects, services)
components/
  ui/                  design system primitives
  layout/              header, footer, etc
lib/utils.ts           cn()
providers/             theme, language, user
utils/                 fetch, constants, interfaces
```

## Rules

- Icons: `@phosphor-icons/react` only. Never hand-roll SVG paths.
- API calls go through `$fetch` from `utils/fetch.ts`. Never raw `fetch` on the client.
- Use design tokens from `globals.css` (`--primary`, `--bg`, `--outline`, `--on-bg-high`, etc). Never hardcode hex.
- Full-height blocks: `min-h-[100dvh]`, not `h-screen`.
- Client components start with `"use client"`. Everything else is RSC.
- Compose with `components/ui/*`. Edit a primitive only to fix a bug.
- Use the `useLanguage()` hook for ALL user-facing strings. Do not hardcode Russian or English text in components.
- Image optimization: Use `next/image` with sizes.
- Auth state: use `useUser()` from `@/entities/user/model/user-context`.
