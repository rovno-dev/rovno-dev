"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import ym, { YMInitializer } from "react-yandex-metrika";

const YM_COUNTER_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);

if (!YM_COUNTER_ID || Number.isNaN(YM_COUNTER_ID)) {
  console.error('Yandex Metrika ID is not set');
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

export const YandexMetrika = () => {
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
