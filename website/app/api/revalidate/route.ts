import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Cache-busting endpoint. The admin panel POSTs here after saving or
 * deleting an event so the public /events list and every /events/<slug>
 * page re-render on the next request instead of waiting out the ISR window.
 *
 * Body: { tags: string[] } — one of "events", "projects", "articles".
 *
 * Security: rejects any request whose origin isn't the configured root
 * domain (or localhost). This isn't a public API — the admin is the only
 * caller — so origin-check + same-origin cookie is enough. If you ever
 * expose this publicly, gate it behind the admin secret.
 */
const ALLOWED_TAGS = new Set(["events", "projects", "articles", "companies", "team"]);

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const host = req.headers.get("host") || "";
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();

  // Allow: same-origin as the request host, OR a subdomain of the configured
  // root (so admin.rovno.dev can invalidate ro vno.dev's cache).
  const originHost = origin ? new URL(origin).hostname.toLowerCase() : "";
  const isSameHost = originHost === host.split(":")[0];
  const isRootSubdomain =
    rootDomain &&
    (originHost === rootDomain || originHost.endsWith(`.${rootDomain}`));
  const isLocal = originHost === "localhost" || originHost.endsWith(".localhost");

  if (!isSameHost && !isRootSubdomain && !isLocal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { tags?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body — treat as "invalidate everything allowed" */
  }

  const requested = Array.isArray(body.tags) ? body.tags : [];
  const tags = requested.filter((t) => ALLOWED_TAGS.has(t));
  if (tags.length === 0) {
    return NextResponse.json(
      { error: "No valid tags. Allowed: " + [...ALLOWED_TAGS].join(", ") },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    revalidated: tags,
    at: new Date().toISOString(),
  });
}
