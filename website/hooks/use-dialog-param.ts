"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * URL-backed dialog state. Opening a dialog writes a search param; closing
 * removes it. Because the param is in the URL, dialogs are deep-linkable and
 * browser back closes them without extra work.
 *
 * Usage:
 *   const dlg = useDialogParam("edit");
 *   <Dialog open={dlg.isOpen} onOpenChange={(o) => (o ? dlg.open(id) : dlg.close())}>
 *
 * For a "new" dialog, pass a sentinel like "new" as the value.
 */
export function useDialogParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(key);
  const isOpen = value !== null;

  const open = useCallback(
    (v: string = "1") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, v);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [key, pathname, router, searchParams]);

  /** True when the open dialog is the "create" one. */
  const isNew = value === "new";

  return useMemo(
    () => ({ value, isOpen, isNew, open, close }),
    [value, isOpen, isNew, open, close],
  );
}
