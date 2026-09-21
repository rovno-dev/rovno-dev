"use client";
import { useEffect, useState } from "react";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").trim().toLowerCase();

/**
 * Returns the href a logo click should navigate to.
 * - On the root domain (or in dev without NEXT_PUBLIC_ROOT_DOMAIN set): "/"
 * - On any subdomain (app.*, admin.*, i.*): absolute URL to the root domain
 *
 * Starts as "/" to keep SSR output hydration-safe; upgrades on the client.
 */
export function useRootHref(): string {
  const [href, setHref] = useState("/");
  useEffect(() => {
    if (!ROOT_DOMAIN) return;
    const host = window.location.hostname.toLowerCase();
    if (host !== ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
      setHref(`https://${ROOT_DOMAIN}`);
    }
  }, []);
  return href;
}
