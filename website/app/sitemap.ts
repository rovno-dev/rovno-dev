import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : 'http://localhost:3000';

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000';

// Regenerate once an hour. The sitemap is served as a static route — it must
// not call the API on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/projects`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/companies`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/about`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/order`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/docs`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/docs/privacy`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/docs/cookies`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/docs/terms`,             lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE_URL}/docs/reviews-consent`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
  ];

  // Never let a flaky API break the sitemap. Each list degrades to [].
  const fetchList = async (path: string): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 } } as any);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    } catch {
      return [];
    }
  };

  const [projects, articles] = await Promise.all([
    fetchList('/api/v1/projects'),
    fetchList('/api/v1/articles'),
  ]);

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p: any) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a: any) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...articleRoutes];
}
