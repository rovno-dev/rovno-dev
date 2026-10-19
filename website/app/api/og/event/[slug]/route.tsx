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
  
  let event = null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/events/${slug}`, { cache: "no-store" });
    if (res.ok) event = await res.json();
  } catch (e) {
    // Ignore fetch error, use fallback below
  }

  const title = event?.title || "Наш.Dev Event";
  const date = event?.start_at 
    ? new Date(event.start_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "Скоро";
  const location = event?.location_name || "Онлайн";

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
        {/* Background Grid Pattern */}
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
        
        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", zIndex: 10 }}>
          
          {/* Top Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#CCFF00", fontSize: 24, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            <span>{"$"} cat event.conf</span>
          </div>

          {/* Title */}
          <div style={{ display: "flex", fontSize: 72, fontWeight: "bold", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: "900px" }}>
            {title}
          </div>

          {/* Bottom Info */}
          <div style={{ display: "flex", gap: "40px", fontSize: 32, color: "#888" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#CCFF00" }}>📅</span> {date}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#CCFF00" }}>📍</span> {location}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
