"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Github, RefreshCw } from "lucide-react";
import { fetchGithubReadme } from "@/utils/api/projects";

/**
 * Collapsible README preview for a github-kind tag. Fetches from the
 * backend proxy (which hits raw.githubusercontent.com and caches for 5 min).
 * Used in the admin editor so the admin can see what will render publicly.
 */
export function GithubReadmePreview({ repo, branch }: { repo: string; branch?: string }) {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ready"; readme: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const load = async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetchGithubReadme(repo, branch);
      if (!res) throw new Error("README не найден");
      setState({ kind: "ready", readme: res.readme });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || "Ошибка" });
    }
  };

  useEffect(() => { setState({ kind: "idle" }); }, [repo, branch]);

  return (
    <Card className="rounded-2xl border-(--outline) bg-(--bg) p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Github className="size-4 text-(--on-bg-medium)" />
        <code className="text-xs font-mono text-(--on-bg-medium) flex-1 truncate">{repo}</code>
        {state.kind === "ready" && (
          <Button variant="text" size="icon-small" onClick={load} title="Обновить">
            <RefreshCw className="size-3.5" />
          </Button>
        )}
      </div>

      {state.kind === "idle" && (
        <Button type="button" variant="outlined" size="small" onClick={load}>
          Загрузить README
        </Button>
      )}
      {state.kind === "loading" && (
        <div className="flex items-center gap-2 text-xs text-(--on-bg-low) py-2">
          <Loader2 className="size-3.5 animate-spin" />
          Загрузка из GitHub…
        </div>
      )}
      {state.kind === "error" && (
        <p className="text-xs text-(--error) py-1">{state.message}</p>
      )}
      {state.kind === "ready" && (
        <pre className="max-h-64 overflow-auto text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-(--on-bg-medium) bg-(--card) rounded-lg p-3">
          {state.readme.slice(0, 4000)}
          {state.readme.length > 4000 && "\n\n… (truncated)"}
        </pre>
      )}
    </Card>
  );
}
