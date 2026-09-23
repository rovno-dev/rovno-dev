// LLM context: cross-subdomain navigation helper.
//
// Two modes, chosen automatically at runtime:
//
//   • PATH MODE  — current host is localhost / *.localhost / 127.0.0.1,
//                  or no root domain is configured. Every "cross-subdomain"
//                  URL collapses to a plain path on the current origin:
//                    crossSubdomainUrl("app", "/profile") → "/app/profile"
//                  This is the only mode that works in local dev: Chrome
//                  rejects `Domain=.localhost` cookies, the subdomain hosts
//                  have no routes, and the proxy rewrite isn't wired.
//
//   • SUBDOMAIN MODE — real registrable root domain (prod). URLs become
//                  absolute: "https://app.rovno.dev/profile".

function normalizeRootDomain(raw: string | undefined | null): string {
  if (!raw) return "";
  let v = raw.trim().toLowerCase();
  v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // strip scheme
  v = v.split("/")[0];                          // strip path
  v = v.split(":")[0];                          // strip port
  return v;
}

const ROOT_DOMAIN = normalizeRootDomain(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
const CONFIGURED_PROTOCOL = (process.env.NEXT_PUBLIC_PROTOCOL || "").trim().toLowerCase();

function resolvedScheme(): "http" | "https" {
  if (CONFIGURED_PROTOCOL === "http" || CONFIGURED_PROTOCOL === "https") {
    return CONFIGURED_PROTOCOL;
  }
  if (typeof window !== "undefined" && window.location.protocol === "http:") return "http";
  return "https";
}

function currentPort(): string {
  if (typeof window === "undefined") return "";
  return window.location.port ? ":" + window.location.port : "";
}

function currentHostname(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.hostname.toLowerCase();
}

/**
 * True when we should stay on the current origin and use path-based routing.
 * - No NEXT_PUBLIC_ROOT_DOMAIN configured → nothing to jump to.
 * - NEXT_PUBLIC_ROOT_DOMAIN === "localhost" → dev.
 * - Current host is localhost / *.localhost / 127.0.0.1 → dev regardless
 *   of what the env says (defensive: env may be set to the prod domain).
 */
export function isPathMode(): boolean {
  if (!ROOT_DOMAIN) return true;
  if (ROOT_DOMAIN === "localhost") return true;
  const h = currentHostname();
  if (!h) return false;
  return h === "localhost" || h.endsWith(".localhost") || h === "127.0.0.1";
}

/** Bare root host when we're on a single-label subdomain of it, else null. */
export function getRootHost(): string | null {
  if (isPathMode()) return null;
  const hostname = currentHostname();
  if (!hostname) return null;
  if (hostname === ROOT_DOMAIN) return null;
  if (hostname.endsWith("." + ROOT_DOMAIN)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && !sub.includes(".")) return ROOT_DOMAIN;
  }
  return null;
}

export function isOnSubdomain(): boolean {
  return getRootHost() !== null;
}

/** Absolute URL to the root domain when on a subdomain; relative path otherwise. */
export function rootDomainUrl(path: string): string {
  const p = path.startsWith("/") ? path : "/" + path;
  if (isPathMode()) return p;
  const root = getRootHost();
  if (!root) return p;
  return `${resolvedScheme()}://${root}${currentPort()}${p}`;
}

/**
 * Absolute URL to a named subdomain in prod, or a plain path in dev.
 *
 *   prod  crossSubdomainUrl("app", "/profile")   → "https://app.rovno.dev/profile"
 *   dev   crossSubdomainUrl("app", "/profile")   → "/app/profile"
 *
 * The dev form matches the actual route tree: `app/(Subdomains)/app/profile`
 * resolves to the URL `/app/profile` (route groups don't contribute to the
 * URL), so this is where the browser should be sent.
 */
export function crossSubdomainUrl(subdomain: string, path: string = "/"): string {
  const p = path.startsWith("/") ? path : "/" + path;
  if (isPathMode()) return `/${subdomain}${p}`;
  return `${resolvedScheme()}://${subdomain}.${ROOT_DOMAIN}${currentPort()}${p}`;
}

export function isAbsoluteUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
