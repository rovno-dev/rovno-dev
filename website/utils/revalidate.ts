/**
 * Fire-and-forget cache invalidation. The admin panel calls this after
 * mutating a resource so the public site reflects the change immediately
 * instead of waiting out the ISR window.
 *
 * Failures are silent — a failed revalidation just means the change
 * appears on the next natural revalidate, which is a graceful degradation.
 */
export async function revalidateTags(tags: string[]): Promise<void> {
  if (!Array.isArray(tags) || tags.length === 0) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    /* silent — see doc above */
  }
}
