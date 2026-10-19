import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://main-service:8000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  let article = null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/articles/${slug}`, { cache: "no-store" });
    if (res.ok) article = await res.json();
  } catch (e) {}

  const title = article?.title || "Журнал Rovno.dev";
  const author = article?.author?.name || article?.author?.username || "Rovno.dev";
  const date = article?.date 
    ? new Date(article.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "white",
          padding: "80px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
            display: "flex",
          }}
        />
        
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#336DFF", fontSize: 24, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            <span>{"$"} cat article.mdx</span>
          </div>

          <div style={{ display: "flex", fontSize: 64, fontWeight: "bold", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: "900px" }}>
            {title}
          </div>

          <div style={{ display: "flex", gap: "40px", fontSize: 24, color: "#888" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#336DFF" }}>✍</span> {author}
            </div>
            {date && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#336DFF" }}>📅</span> {date}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
