# Website — UI/UX Specification

This document is the **source of truth** for replicating the exact look, feel, and architecture of the Rovno.dev frontend. An AI reading this and the corresponding codebase should be able to rebuild the UI from scratch identically.

## 1. Tech Stack & Architecture

- **Framework:** Next.js 16+ (App Router, React Server Components).
- **Styling:** Tailwind CSS v4 (using `@theme inline` and CSS variables).
- **UI Primitives:** Radix UI + shadcn/ui (heavily customized, never used in default state).
- **Icons:** `@phosphor-icons/react` (default weight, usually `regular` or `bold`).
- **Motion:** `motion/react` (Framer Motion).
- **State:** React Context (`UserProvider`, `LanguageProvider`, `ThemeProvider`). Avoid Redux/Zustand unless absolutely necessary.
- **Data Fetching:** Custom `$fetch` wrapper around native `fetch` with automatic JWT refresh, toast handling, and JSON parsing.

## 2. Design System (The "Premium Minimalism" Look)

The aesthetic is **Premium Utilitarian Minimalism / Editorial**. 
- **No heavy drop shadows.** Use crisp 1px borders (`--outline`) to separate surfaces.
- **No generic AI blue/purple gradients.** 
- **Glassy elements** (backdrop-blur, semi-transparent backgrounds) are used exclusively for sticky headers and floating toolbars.
- **Extreme whitespace.** Let the content breathe.

### 2.1 Global CSS Variables
Tokens live in `app/globals.css`. **Never hardcode hex colors.**

@@@css
:root {
  /* Dark Mode is default */
  --primary: #ECECEE;
  --primary-gradient: linear-gradient(180deg, #FFFFFF 0%, #ECECEE 100%);
  --on-primary: #0A0A0B;
  --primary-card: color-mix(in srgb, var(--primary), transparent 84%);
  
  --outline: #1F1F23; /* Border color */
  --bg: #0A0A0B;      /* Page background */
  --card: #111114;    /* Surface background */
  
  --on-bg-high: #ECECEE;   /* Headings */
  --on-bg-medium: #A1A1A6; /* Body text */
  --on-bg-low: #6B6B70;    /* Muted text, labels */
  
  --primary-glass: color-mix(in srgb, var(--primary), transparent 95%);
  --state-hover: color-mix(in srgb, #fff, transparent 95%);
}

/* Light mode overrides under .light class */
@@@

### 2.2 Typography
Font: **Geist** (Variable sans-serif).
- **Display:** `text-display-1` (3rem) to `text-display-5` (1.25rem). Tight tracking (`tracking-tighter`).
- **Headings:** `text-heading-1` to `text-heading-6`.
- **Body:** `text-body-1` (1.25rem) to `text-body-5` (0.75rem).
- **Monospace:** Used for terminal aesthetics, metadata, and tech specs. (`font-mono`)

## 3. Core Components (Build these first)

### 3.1 Buttons (`components/ui/button.tsx`)
- **Filled:** `bg-(--primary)` text `-(--on-primary)`. Hover shifts opacity.
- **Outlined:** Transparent bg, 1px border `--outline`. Hover creates subtle state-hover bg.
- **Glass:** For sticky headers/floating elements. `bg-(--primary-glass)`, `backdrop-blur-md`, border `--outline`.
- **Sizes:** `small` (h-36px), `medium` (h-42px), `large` (h-54px), `xlarge` (h-64px).
- **Shapes:** `rounded-lg` (default) or `rounded-full` (pill).

### 3.2 Cards (`components/ui/card.tsx`)
- **Background:** `bg-(--card)`.
- **Border:** 1px solid `--outline`.
- **Radius:** `rounded-3xl` or `rounded-4xl` for big sections, `rounded-xl` for inner elements.
- **Hover:** Subtle border color change (to `--on-bg-low`) and a slight `-translate-y-1`, NO heavy shadow.

### 3.3 Inputs (`components/ui/input.tsx`)
- `h-10`, `rounded-lg`, border `--outline`.
- Focus state: ring-3 with `--primary-glass`. No background change.

### 3.4 Admin Tables
- Clean, minimal. No vertical borders. Row hover `bg-(--state-hover)`.
- Text aligned left. Numbers monospaced.

## 4. Page Layouts

### 4.1 Public Layout
- **Header:** Sticky top-0. Glass effect (`backdrop-blur`). Max-width shrinks on scroll. Logo left, nav center, CTA/Theme/Language right.
- **Footer:** Grid of links. Legal links on the right. 1px top border.
- **Container:** `max-w-[1200px] mx-auto px-4`.

### 4.2 Admin Layout (`/admin/[secret]/*`)
- **Sidebar:** Fixed on desktop, collapsible (stored in `localStorage`). Dark background, slim (w-64). Active link has a subtle glass background (`bg-(--primary-glass)`).
- **Content:** Scrolls naturally. Lots of tables, forms, and stats.
- **Header:** Minimal, just breadcrumbs and user profile.

## 5. Motion & Interactions

- **Reveal on Scroll:** Elements fade in and move up (`translateY(20px)` to `0`) using `IntersectionObserver` (via `motion/react`).
- **Stagger:** Grid items reveal with a delay (e.g., `delay: idx * 0.05`).
- **Hover:** Cards lift slightly. Buttons scale down slightly on click (`scale-[0.98]`).
- **No over-animation.** Avoid looping animations unless it's an ASCII art background or a specific interactive element (like the AI Slider).

## 6. Specific Custom Features
- **ASCII Animations:** Terminal aesthetics. `<pre>` tags with precise monospace fonts.
- **Liquid Glass:** Used in headers. 1px inner border (`inset 0 1px 0 rgba(255,255,255,0.1)`) to simulate edge refraction.
- **Bento Grids:** Used in the services/highlights section. A mix of large and small `col-span` and `row-span` blocks, filled with dark surfaces.

## 7. i18n (Internationalization)

- **Context:** `LanguageProvider` wraps the app. Detects browser language (ru/en) and stores preference in `localStorage`.
- **Hook:** `useLanguage()` returns `t(key)` and `lang`.
- **Dictionaries:** Located in `entities/i18n/`. All text in components MUST use `t('namespace.key')`. Never hardcode strings.
- **Date/Number formatting:** Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with the active `lang`.

## 8. Auth & User Flow

- **Tokens:** JWT stored in cookies (`access_token`, `refresh_token`). Managed by `safe-cookie-storage.ts` (falls back gracefully if cookies are blocked).
- **Context:** `UserProvider` fetches `/me` on mount.
- **Guard:** `CheckUser` (protects admin/profile) and `CheckNotUser` (protects login/register).
- **Refresh:** The `$fetch` wrapper intercepts 401s, calls `/refresh`, updates the token, and retries the original request seamlessly.
