import { crossSubdomainUrl } from "@/utils/root-domain";

/**
 * Build a URL to a page inside the admin panel.
 *
 * The panel lives at `<secret>/...` on the `admin.` subdomain:
 *   prod -> https://admin.<root>/<secret>/<path>
 *   dev  -> /admin/<secret>/<path>            (path mode, same origin)
 *
 * Never prepend `/admin` at the call site. The subdomain (prod) or the
 * leading path segment (dev) already carries it, so a hardcoded
 * `/admin/${secret}/...` renders `admin.<root>/admin/<secret>/...` in
 * prod — which proxy.ts rewrites into a 404.
 *
 * `path` may be passed with or without a leading slash.
 */
export function adminUrl(
  secret: string | null | undefined,
  path: string = "",
): string {
  if (!secret) return "/";
  const clean = path.replace(/^\/+|\/+$/g, "");
  return crossSubdomainUrl("admin", clean ? `/${secret}/${clean}` : `/${secret}`);
}
