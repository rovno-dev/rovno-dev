"use client";
import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
export type CookieConsentMode = "all" | "necessary";
export interface CookieConsentRecord {
  mode: CookieConsentMode;
  at: string; // ISO timestamp
}
const STORAGE_KEY = "cookie-consent";
export const CONSENT_EVENT = "cookie-consent-change";
/** Read the stored consent. Handles the legacy "true" string from earlier builds. */
export function readConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.mode === "all" || parsed.mode === "necessary")) {
      return parsed as CookieConsentRecord;
    }
    return null;
  } catch {
    if (raw === "true") return { mode: "all", at: new Date().toISOString() };
    return null;
  }
}
/** Write consent and notify listeners. */
export function writeConsent(mode: CookieConsentMode): CookieConsentRecord {
  const record: CookieConsentRecord = { mode, at: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent<CookieConsentRecord>(CONSENT_EVENT, { detail: record }));
  return record;
}
/** Clear consent (used by "Настройки cookie" link). */
export function clearConsent() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}
// LLM context: all user-facing strings go through useLanguage(). The banner is
// rendered inside <LanguageProvider> (see app/layout.tsx), so switching the
// language in the header re-renders the banner in place — no reload needed.
export function CookieConsent() {
  const { t } = useLanguage();
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);
  const handleChoice = (mode: CookieConsentMode) => {
    writeConsent(mode);
    setShow(false);
  };
  if (!show) return null;
  return (
    <div className="fixed right-0 bottom-25 md:bottom-4 z-50 md:right-8 md:bottom-8 animate-reveal">
      <Card className="flex mx-4 max-w-full sm:max-w-[380px] flex-col gap-4 p-5 shadow-2xl bg-(--card)/95 backdrop-blur-md border-(--outline)">
        <div className="space-y-2">
          <h4 className="text-heading-4">{t("cookie.title")}</h4>
          <p className="text-xs leading-relaxed text-(--on-bg-medium)">
            {t("cookie.body")}{" "}
            <Link
              href="/docs/cookies"
              className="text-(--primary) underline underline-offset-2"
            >
              {t("cookie.policy_link")}
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="small"
            variant="filled"
            onClick={() => handleChoice("all")}
          >
            {t("cookie.accept_all")}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleChoice("necessary")}
          >
            {t("cookie.necessary_only")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
