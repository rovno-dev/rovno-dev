"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ym, { YMInitializer } from "react-yandex-metrika";
import {
  readConsent,
  CONSENT_EVENT,
  type CookieConsentRecord,
} from "@/components/layout/marketing/cookie-consent";

const YM_COUNTER_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);

if (!YM_COUNTER_ID || Number.isNaN(YM_COUNTER_ID)) {
  console.error("Yandex Metrika ID is not set");
}

function RouterTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (pathname) {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      ym("hit", url);
    }
  }, [pathname, searchParams]);
  return null;
}

/**
 * Metrika only mounts when the user consented to "all" cookies. When the
 * choice changes to "necessary" we intentionally do NOT unmount-and-reload
 * an already-running counter (that would itself be a tracking signal); the
 * gate matters on first load.
 */
export const YandexMetrika = () => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const apply = (rec: CookieConsentRecord | null) => {
      setAllowed(rec?.mode === "all");
    };
    apply(readConsent());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentRecord | null>).detail;
      apply(detail ?? null);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <YMInitializer
        accounts={[YM_COUNTER_ID!]}
        options={{
          defer: true,
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
        }}
        version="2"
      />
      <Suspense fallback={null}>
        <RouterTracker />
      </Suspense>
    </>
  );
};
