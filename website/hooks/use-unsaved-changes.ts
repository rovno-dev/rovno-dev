"use client";
import { useEffect, useRef } from "react";

/**
 * Warns the user before navigating away from an unsaved form.
 *
 * Covers three navigation paths:
 *   1. Hard navigation (reload, tab close, external link) → `beforeunload`.
 *   2. In-app anchor clicks (`<Link>`, plain `<a>`) → capture-phase click.
 *   3. Browser back / forward → `popstate` plus a sentinel history entry,
 *      so the back button pops the sentinel first (URL unchanged, so the
 *      form does NOT unmount) and the user sees the confirm dialog.
 *
 * Programmatic `router.push()` from a button handler is intentionally NOT
 * intercepted: those code paths already save or discard the form first, so
 * prompting there would be wrong.
 */
export function useUnsavedChanges(isDirty: boolean, message: string) {
  // Keep the latest message in a ref so the effect does not re-run when the
  // parent re-renders with a fresh (same value) string.
  const messageRef = useRef(message);
  messageRef.current = message;

  useEffect(() => {
    if (!isDirty) return;

    const confirmLeave = () => window.confirm(messageRef.current);

    // 1. Hard navigation (reload / tab close / external link).
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = messageRef.current;
      return messageRef.current;
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // 2. In-app anchor clicks. Capture phase so we run before Next.js's
    //    <Link> onClick handler, which is attached on the React root element.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }
      if (!confirmLeave()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      // User confirmed. Untag the sentinel so it doesn't stay trapped in
      // history after Next.js pushes the new URL on top of this entry.
      if (
        window.history.state &&
        (window.history.state as { __unsavedGuard?: boolean }).__unsavedGuard
      ) {
        window.history.replaceState({}, "", window.location.href);
      }
    };
    document.addEventListener("click", onClick, true);

    // 3. Browser back / forward. Push a sentinel entry with the SAME URL so
    //    the back button pops it first — the form stays mounted (URL didn't
    //    change) and we get a popstate event we can respond to.
    const sentinel = { __unsavedGuard: true };
    const originalHref = window.location.href;
    window.history.pushState(sentinel, "", originalHref);

    const onPopState = () => {
      // Popped our own sentinel — nothing to do.
      if (
        window.history.state &&
        (window.history.state as { __unsavedGuard?: boolean }).__unsavedGuard
      ) {
        return;
      }
      if (confirmLeave()) {
        // Confirmed: remove the listener and pop the sentinel so the user's
        // intended back navigation actually completes.
        window.removeEventListener("popstate", onPopState);
        window.history.back();
      } else {
        // Cancelled: stay on the form by pushing a fresh sentinel.
        window.history.pushState(sentinel, "", originalHref);
      }
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      // Pop the sentinel so history is not left with a duplicate entry.
      // (Fires on save, or on unmount after a confirmed navigation.)
      if (
        window.history.state &&
        (window.history.state as { __unsavedGuard?: boolean }).__unsavedGuard
      ) {
        window.history.back();
      }
    };
  }, [isDirty]);
}
