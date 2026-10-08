"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the admin URL secret from /api/admin-secret.
 *
 * `refreshKey` is an opaque value the caller can bump to force a refetch.
 * The canonical case: the header needs the secret the moment the user
 * logs in as admin/root, but the effect would otherwise only fire once
 * on mount — when no auth cookie exists yet, so /api/admin-secret returns
 * 401 and the secret stays null until a full page reload. Passing the
 * user id (or any value that changes with the auth state) makes the
 * hook re-fetch as soon as the identity resolves.
 */
export function useAdminSecret(refreshKey?: string | number | null) {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const res = await fetch("/api/admin-secret", {
          cache: "no-store",
        });
        if (!res.ok) {
          console.warn(
            `[useAdminSecret] /api/admin-secret returned ${res.status}`
          );
          if (!cancelled) setSecret(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setSecret(data?.secret || null);
      } catch (err) {
        console.error("[useAdminSecret] fetch failed:", err);
        if (!cancelled) setSecret(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { secret, loading };
}
