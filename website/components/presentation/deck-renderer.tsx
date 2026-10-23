"use client";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import { tsxScope } from "./tsx-scope";

export function DeckRenderer({ code }: { code: string }) {
  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden flex flex-col">
      <LiveProvider code={code} scope={tsxScope} noInline={true}>
        <div className="flex-1 relative">
          <LivePreview className="absolute inset-0" />
        </div>
        <LiveError className="absolute bottom-4 left-4 z-50 bg-red-500/20 text-red-500 p-4 rounded text-xs font-mono max-w-lg backdrop-blur-md border border-red-500/50" />
      </LiveProvider>
    </div>
  );
}
