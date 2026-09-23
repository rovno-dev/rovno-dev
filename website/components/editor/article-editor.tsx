"use client";
import dynamic from "next/dynamic";
// LLM context: MDXEditor pulls in CodeMirror and cannot be SSR'd. The dynamic
// wrapper keeps the ~200KB editor bundle out of the initial page load; it
// only downloads when the article form mounts.
const EditorImpl = dynamic(() => import("./editor-impl"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-(--outline) bg-(--card) p-5 min-h-[420px] flex items-center justify-center">
      <span className="text-body-3 text-(--on-bg-low) animate-pulse">Loading editor…</span>
    </div>
  ),
});
export function ArticleEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return <EditorImpl markdown={value} onChange={onChange} placeholder={placeholder} />;
}
