import type { Metadata } from "next";

/**
 * Canonical site origin.
 *
 * Resolved from NEXT_PUBLIC_ROOT_DOMAIN, which Next inlines at BUILD
 * time. If it is missing at build, this falls back to localhost - and
 * every og:image / canonical URL in the deployed metadata will point at
 * localhost, which is the single most common reason OG "just doesn't
 * show" in prod. The env var must be present in the docker build args
 * (see website/docker-compose.yml), not only in the runtime env.
 */
const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : "http://localhost:3000";

export const SITE_NAME = "Rovno.dev";

export const DEFAULT_OG_IMAGE =
  "/api/og?title=Rovno.dev&subtitle=Digital%20Agency";

/** Social crawlers can't render these as previews - they silently drop
 *  the whole og:image entry rather than fall back. */
const VIDEO_EXT = /\.(webm|mp4|mov|m4v)$/i;

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : "/" + path}`;
}

/**
 * Resolves the image a crawler should show for a page.
 *
 * `candidate` is whatever the entity stores as its cover. If it is a
 * video (project/event covers can be .webm or .mp4), it is replaced with
 * `fallbackPath` - a generated card. That is exactly the bug behind
 * "project OG isn't showing": cover_image_src was a webm for ALX and the
 * link preview came out blank.
 */
export function resolveOgImage(
  candidate: string | null | undefined,
  fallbackPath: string = DEFAULT_OG_IMAGE,
): string {
  if (!candidate) return absoluteUrl(fallbackPath);
  if (VIDEO_EXT.test(candidate)) return absoluteUrl(fallbackPath);
  return absoluteUrl(candidate);
}

export function buildOgImageUrl(title: string, subtitle?: string): string {
  const qs = new URLSearchParams({ title });
  if (subtitle) qs.set("subtitle", subtitle);
  return `/api/og?${qs.toString()}`;
}

/**
 * Normalizes a title to exactly one site suffix. Callers may pass
 * "Blog", "Blog · Rovno.dev", or "Разработка на 1С | Rovno.dev"
 * - all three resolve to "X · Rovno.dev". Without this a page whose
 * title already carried a suffix would render "X · Rovno.dev · Rovno.dev".
 */
function normalizeTitle(title: string): string {
  let t = (title || "").trim();
  t = t.replace(/\s*[·|]\s*Rovno\.dev\s*$/i, "");
  t = t.replace(/\s+Rovno\.dev\s*$/i, "");
  t = t.trim();
  return t || SITE_NAME;
}

export interface PageMetaOptions {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
}

/**
 * Builds a complete Metadata object with canonical URL, Open Graph and
 * a matching Twitter card.
 *
 * `title` is wrapped in `{ absolute }` so the layout's title template
 * ("%s · Rovno.dev") is bypassed - otherwise the suffix would apply
 * twice and every page title would be "X · Rovno.dev · Rovno.dev".
 */
export function pageMetadata({
  title,
  description = "",
  path,
  ogImage = DEFAULT_OG_IMAGE,
  type = "website",
}: PageMetaOptions): Metadata {
  const clean = normalizeTitle(title);
  const fullTitle = `${clean} · ${SITE_NAME}`;
  const absImage = absoluteUrl(ogImage);
  const absUrl = absoluteUrl(path);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: absUrl },
    openGraph: {
      type,
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: absUrl,
      title: fullTitle,
      description,
      images: [
        {
          url: absImage,
          width: 1200,
          height: 630,
          alt: clean,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absImage],
    },
  };
}
