# syntax=docker/dockerfile:1.7

# Pinned major so pulls are reproducible across builds.
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# ── deps ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
# Cache mount keeps the npm tarball cache across builds — the 2nd build
# onward is download-free. Removing it costs ~1–3 min on a slow box.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# ── builder ──────────────────────────────────────────────────────────
FROM base AS builder

ARG NEXT_PUBLIC_ROOT_DOMAIN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_HTTP_PROTOCOL=https
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_HTTP_PROTOCOL=$NEXT_PUBLIC_HTTP_PROTOCOL \
    NODE_OPTIONS=--max-old-space-size=3072

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Two cache mounts matter here:
#   /root/.npm      — the package tarball cache (shared with the deps stage)
#   /app/.next/cache — Next's incremental compile cache, reused across builds
# Removing either one makes every rebuild start cold.
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npm run build

# ── prod ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
