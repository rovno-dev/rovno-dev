const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export interface PublicStats {
  projects: number;
  companies: number;
  articles: number;
  events: number;
  team: number;
}

const EMPTY: PublicStats = {
  projects: 0,
  companies: 0,
  articles: 0,
  events: 0,
  team: 0,
};

/** Server-side fetch for the home page counters. Fails soft to all-zeros. */
export async function fetchPublicStatsServer(): Promise<PublicStats> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/stats`, {
      next: { revalidate: 300 },
    } as any);
    if (!res.ok) return EMPTY;
    const body = await res.json();
    return { ...EMPTY, ...body } as PublicStats;
  } catch {
    return EMPTY;
  }
}
