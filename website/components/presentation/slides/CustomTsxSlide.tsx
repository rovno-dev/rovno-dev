"use client";

import { LiveProvider, LiveError, LivePreview } from "react-live";
import * as React from "react";
import * as FramerMotion from "framer-motion";

// Strictly limit the scope to safe React + Motion primitives.
// No window, document, fetch, or eval allowed.
const scope = {
  ...React,
  motion: FramerMotion.motion,
  AnimatePresence: FramerMotion.AnimatePresence,
};

/**
 * Normalise user-authored TSX before it reaches React.
 *
 * The single biggest footgun when hand-writing JSX in the sandbox is
 * typing `classname=` (HTML habit) instead of `className=`. React then
 * sees an unknown lowercase attribute on an element and logs:
 *   "Invalid DOM property `classname`. Did you mean `className`?"
 *
 * `\bclassname=` only matches at a word boundary, so variable names like
 * `myclassname=` or `subclassname=` are left untouched. The replace is
 * idempotent — running it twice is safe.
 */
function normaliseClassname(code: string): string {
  return code.replace(/\bclassname=/g, "className=");
}

export function CustomTsxSlide({ content }: { content: Record<string, any> }) {
  const rawCode =
    content.code ||
    `<div className="flex items-center justify-center h-full text-white"><p>No code provided</p></div>`;
  const code = normaliseClassname(rawCode);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <LiveProvider code={code} scope={scope} noInline={false}>
        <div className="absolute inset-0 w-full h-full">
          <LivePreview />
        </div>
        <div className="absolute bottom-4 left-4 z-50">
          <LiveError className="bg-red-500/20 text-red-500 text-xs font-mono p-2 rounded border border-red-500/50 backdrop-blur-md max-w-lg" />
        </div>
      </LiveProvider>
    </div>
  );
}
