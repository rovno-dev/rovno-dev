"use client";

import { LiveProvider, LiveError, LivePreview } from "react-live";
import { tsxScope } from "./tsx-scope";

/**
 * Normalise user-authored TSX before it reaches React.
 *
 * See CustomTsxSlide.tsx for the full rationale — this is the same fix,
 * applied to the deck-level code path. `\bclassname=` only matches at a
 * word boundary so variable names are safe.
 */
function normaliseClassname(code: string): string {
  return code.replace(/\bclassname=/g, "className=");
}

export function DeckRenderer({ code }: { code: string }) {
  const safeCode = normaliseClassname(code);

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden flex flex-col">
      <LiveProvider code={safeCode} scope={tsxScope} noInline={true}>
        <div className="flex-1 relative">
          <LivePreview className="absolute inset-0" />
        </div>
        <LiveError className="absolute bottom-4 left-4 z-50 bg-red-500/20 text-red-500 p-4 rounded text-xs font-mono max-w-lg backdrop-blur-md border border-red-500/50" />
      </LiveProvider>
    </div>
  );
}
