import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

interface Props {
  repo: string;
  branch?: string;
}

/**
 * Server-rendered README display. Fetches through the same admin proxy
 * (which caches for 5 min). Fails silently if the repo isn't public or the
 * README is missing — the project page shouldn't 500 over a GitHub blip.
 */
export async function GithubReadmeBlock({ repo, branch }: Props) {
  let readme: string | null = null;
  try {
    const qs = new URLSearchParams({ repo });
    if (branch) qs.set("branch", branch);
    const res = await fetch(
      `${API_BASE}/api/v1/admin/projects/github-readme?${qs}`,
      { next: { revalidate: 300 } } as any
    );
    if (res.ok) readme = (await res.json()).readme;
  } catch {
    /* silent fallback */
  }

  if (!readme) return null;

  return (
    <Card className="rounded-3xl border-(--outline) bg-(--card) p-6">
      <div className="flex items-center gap-2 mb-4">
        <Github className="size-5 text-(--on-bg-medium)" />
        <h2 className="text-heading-3 flex-1 truncate">
          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-(--primary) transition-colors"
          >
            {repo}
          </a>
        </h2>
      </div>
      <pre className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono text-(--on-bg-medium) bg-(--bg) rounded-2xl p-4 max-h-96 overflow-auto">
        {readme.slice(0, 6000)}
        {readme.length > 6000 && "\n\n… (открыть на GitHub для полного README)"}
      </pre>
    </Card>
  );
}
